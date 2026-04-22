import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';
import { MessagingConnection } from './entities/messaging-connection.entity';
import { MessageChannel, MessageDirection, MessagingProvider, MessagingConnectionStatus, LeadSource } from '@steward/shared';

interface MetaPage {
  id: string;
  name: string;
  access_token: string;
}

interface LeadFieldValue {
  name: string;
  values: string[];
}

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);
  private readonly GRAPH_API = 'https://graph.facebook.com/v19.0';

  constructor(
    private readonly config: ConfigService,
    private readonly messaging: MessagingService,
    @InjectRepository(MessagingConnection)
    private readonly connections: Repository<MessagingConnection>,
  ) {}

  // ─── OAuth ────────────────────────────────────────────────────────────────────

  getAuthUrl(advisorId: string): string {
    const appId = this.config.getOrThrow<string>('META_APP_ID');
    const redirectUri = this.config.getOrThrow<string>('META_REDIRECT_URI');
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: 'pages_manage_metadata,pages_read_engagement,pages_messaging,leads_retrieval,pages_show_list',
      response_type: 'code',
      state: advisorId,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
  }

  async handleCallback(code: string, advisorId: string): Promise<MessagingConnection> {
    const appId = this.config.getOrThrow<string>('META_APP_ID');
    const appSecret = this.config.getOrThrow<string>('META_APP_SECRET');
    const redirectUri = this.config.getOrThrow<string>('META_REDIRECT_URI');

    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `${this.GRAPH_API}/oauth/access_token?` +
        new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }),
    );
    if (!tokenRes.ok) {
      throw new BadRequestException('Failed to exchange Facebook authorization code');
    }
    const { access_token } = await tokenRes.json();

    // Exchange for long-lived token
    const llRes = await fetch(
      `${this.GRAPH_API}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: access_token,
        }),
    );
    const { access_token: longLivedToken } = await llRes.json();

    // Fetch connected pages
    const pagesRes = await fetch(
      `${this.GRAPH_API}/me/accounts?access_token=${longLivedToken}&fields=id,name,access_token`,
    );
    const pagesData = await pagesRes.json();
    const pages: MetaPage[] = pagesData.data ?? [];

    const conn = this.connections.create({
      advisor_id: advisorId,
      channel: MessageChannel.MESSENGER,
      provider: MessagingProvider.META,
      status: MessagingConnectionStatus.ACTIVE,
      display_name: 'Facebook — select a page below',
      encrypted_credentials: this.messaging['encryption'].encrypt(
        JSON.stringify({ user_token: longLivedToken }),
      ),
      config: { pages: pages.map((p) => ({ id: p.id, name: p.name })) },
    });
    return this.connections.save(conn);
  }

  async getPages(conn: MessagingConnection): Promise<{ id: string; name: string }[]> {
    return (conn.config['pages'] as { id: string; name: string }[]) ?? [];
  }

  async subscribePage(conn: MessagingConnection, pageId: string): Promise<void> {
    const creds = this.messaging.getDecryptedCredentials(conn);
    const userToken = creds['user_token'] as string;

    // Get page access token
    const pageRes = await fetch(
      `${this.GRAPH_API}/me/accounts?access_token=${userToken}&fields=id,name,access_token`,
    );
    const pagesData = await pageRes.json();
    const page: MetaPage | undefined = (pagesData.data ?? []).find((p: MetaPage) => p.id === pageId);
    if (!page) throw new BadRequestException('Facebook page not found');

    // Subscribe page to webhook
    const subRes = await fetch(`${this.GRAPH_API}/${pageId}/subscribed_apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscribed_fields: ['messages', 'messaging_postbacks', 'leadgen'],
        access_token: page.access_token,
      }),
    });
    if (!subRes.ok) {
      throw new BadRequestException('Failed to subscribe Facebook page to webhooks');
    }

    // Update connection config with selected page
    const updatedConfig = {
      ...conn.config,
      selected_page_id: pageId,
      selected_page_name: page.name,
    };
    // Update encrypted credentials to include page token
    const cred = JSON.parse(this.messaging['encryption'].decrypt(conn.encrypted_credentials ?? '{}'));
    cred['page_token'] = page.access_token;
    cred['page_id'] = pageId;

    await this.connections.update(conn.id, {
      display_name: `Facebook: ${page.name}`,
      config: updatedConfig,
      encrypted_credentials: this.messaging['encryption'].encrypt(JSON.stringify(cred)),
    });
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────────

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const verifyToken = this.config.getOrThrow<string>('META_VERIFY_TOKEN');
    if (mode !== 'subscribe' || token !== verifyToken) {
      throw new UnauthorizedException('Invalid webhook verification token');
    }
    return challenge;
  }

  async handleWebhookEvent(body: any, crmService?: any): Promise<void> {
    const object = body?.object;

    if (object === 'page') {
      for (const entry of body.entry ?? []) {
        // Messenger messages
        for (const event of entry.messaging ?? []) {
          if (event.message) {
            await this.handleMessengerMessage(entry.id, event);
          }
        }
        // Lead Ad form submissions
        for (const change of entry.changes ?? []) {
          if (change.field === 'leadgen' && crmService) {
            await this.handleLeadGenEvent(change.value, crmService);
          }
        }
      }
    }
  }

  private async handleMessengerMessage(pageId: string, event: any): Promise<void> {
    const senderId: string = event.sender?.id;
    const recipientId: string = event.recipient?.id;
    const text: string = event.message?.text ?? '';
    const mid: string = event.message?.mid ?? '';

    const conn = await this.connections.findOne({
      where: { config: { selected_page_id: pageId } as any },
    });
    if (!conn) return;

    await this.messaging.saveMessage({
      advisor_id: conn.advisor_id,
      connection_id: conn.id,
      direction: MessageDirection.INBOUND,
      channel: MessageChannel.MESSENGER,
      from_address: senderId,
      to_address: recipientId,
      body: text,
      external_message_id: mid,
      thread_id: senderId, // PSID as thread id
      is_read: false,
      sent_at: new Date(event.timestamp ?? Date.now()),
    });
  }

  private async handleLeadGenEvent(value: any, crmService: any): Promise<void> {
    const leadgenId: string = value.leadgen_id;
    const pageId: string = value.page_id;

    const conn = await this.connections.findOne({
      where: { config: { selected_page_id: pageId } as any },
    });
    if (!conn) return;

    // Retrieve lead data from Meta Graph API
    const creds = this.messaging.getDecryptedCredentials(conn);
    const pageToken = creds['page_token'] as string;

    try {
      const res = await fetch(
        `${this.GRAPH_API}/${leadgenId}?access_token=${pageToken}&fields=field_data,created_time`,
      );
      const data = await res.json();
      const fields: LeadFieldValue[] = data.field_data ?? [];

      const get = (name: string) =>
        fields.find((f) => f.name.toLowerCase() === name.toLowerCase())?.values?.[0] ?? null;

      const firstName = get('first_name') ?? get('full_name')?.split(' ')?.[0] ?? 'Lead';
      const lastName = get('last_name') ?? get('full_name')?.split(' ')?.slice(1)?.join(' ') ?? '';
      const email = get('email');
      const phone = get('phone_number') ?? get('phone');

      await crmService.createLead(conn.advisor_id, {
        first_name: firstName,
        last_name: lastName,
        email: email ?? undefined,
        phone: phone ?? undefined,
        source: LeadSource.FACEBOOK,
        notes: `Facebook Lead Ad — form submission ID: ${leadgenId}`,
      });
    } catch (err) {
      this.logger.error(`Failed to retrieve lead ${leadgenId} from Meta: ${(err as Error).message}`);
    }
  }

  // ─── Send Messenger Message ──────────────────────────────────────────────────

  async sendMessengerMessage(conn: MessagingConnection, recipientPsid: string, text: string): Promise<void> {
    const creds = this.messaging.getDecryptedCredentials(conn);
    const pageToken = creds['page_token'] as string;

    const res = await fetch(`${this.GRAPH_API}/me/messages?access_token=${pageToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new BadRequestException(`Messenger send failed: ${JSON.stringify(err)}`);
    }
  }
}
