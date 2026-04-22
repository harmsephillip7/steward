import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';
import { MessagingConnection } from './entities/messaging-connection.entity';
import {
  MessageChannel,
  MessageDirection,
  MessagingProvider,
  MessagingConnectionStatus,
  LeadSource,
} from '@steward/shared';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly TWILIO_API = 'https://api.twilio.com/2010-04-01';

  constructor(
    private readonly config: ConfigService,
    private readonly messaging: MessagingService,
    @InjectRepository(MessagingConnection)
    private readonly connections: Repository<MessagingConnection>,
  ) {}

  // ─── Validate & Connect ───────────────────────────────────────────────────────

  async validateAndSave(
    advisorId: string,
    accountSid: string,
    authToken: string,
    fromNumber: string,
    provider: 'twilio' | 'meta_whatsapp' = 'twilio',
  ): Promise<MessagingConnection> {
    if (provider === 'twilio') {
      // Verify credentials by calling Twilio account API
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const res = await fetch(`${this.TWILIO_API}/Accounts/${accountSid}.json`, {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (!res.ok) {
        throw new BadRequestException('Invalid Twilio credentials — please check your Account SID and Auth Token');
      }

      const data = await res.json();
      if (data.status !== 'active') {
        throw new BadRequestException(`Twilio account is not active (status: ${data.status})`);
      }
    }

    const credentials = JSON.stringify({ account_sid: accountSid, auth_token: authToken, from_number: fromNumber });

    const existing = await this.connections.findOne({
      where: { advisor_id: advisorId, provider: provider as MessagingProvider },
    });
    const conn = existing ?? this.connections.create({ advisor_id: advisorId });
    conn.channel = MessageChannel.WHATSAPP;
    conn.provider = provider as MessagingProvider;
    conn.status = MessagingConnectionStatus.ACTIVE;
    conn.display_name = fromNumber;
    conn.encrypted_credentials = this.messaging['encryption'].encrypt(credentials);
    conn.config = { from_number: fromNumber, provider };
    return this.connections.save(conn);
  }

  getWebhookUrl(): string {
    const appUrl = this.config.get<string>('APP_API_URL') ?? 'https://stewardapi-production.up.railway.app';
    return `${appUrl}/webhooks/whatsapp`;
  }

  async verifyConnection(conn: MessagingConnection): Promise<boolean> {
    const creds = this.messaging.getDecryptedCredentials(conn);
    const accountSid = creds['account_sid'] as string;
    const authToken = creds['auth_token'] as string;

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const res = await fetch(`${this.TWILIO_API}/Accounts/${accountSid}.json`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return res.ok;
  }

  // ─── Send Message ─────────────────────────────────────────────────────────────

  async sendMessage(
    conn: MessagingConnection,
    to: string,
    body: string,
  ): Promise<void> {
    const creds = this.messaging.getDecryptedCredentials(conn);
    const accountSid = creds['account_sid'] as string;
    const authToken = creds['auth_token'] as string;
    const fromNumber = creds['from_number'] as string;

    // Ensure numbers are in WhatsApp format for Twilio
    const formatNumber = (n: string) => (n.startsWith('whatsapp:') ? n : `whatsapp:${n}`);

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const res = await fetch(`${this.TWILIO_API}/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: formatNumber(fromNumber),
        To: formatNumber(to),
        Body: body,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new BadRequestException(`WhatsApp send failed: ${err.message ?? JSON.stringify(err)}`);
    }
  }

  // ─── Twilio Webhook (inbound messages) ───────────────────────────────────────

  /**
   * Validates Twilio webhook signature (X-Twilio-Signature header).
   * Returns false if validation fails (should return 403).
   */
  validateTwilioSignature(url: string, params: Record<string, string>, signature: string, authToken: string): boolean {
    // Build sorted key-value string
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, k) => acc + k + params[k], url);

    const { createHmac } = require('crypto');
    const expected = createHmac('sha1', authToken).update(sorted).digest('base64');
    return expected === signature;
  }

  async handleInboundMessage(params: Record<string, string>, crmService?: any): Promise<void> {
    const from: string = params['From'] ?? '';
    const to: string = params['To'] ?? '';
    const body: string = params['Body'] ?? '';
    const sid: string = params['MessageSid'] ?? '';

    // Strip whatsapp: prefix for matching
    const fromNumber = from.replace('whatsapp:', '');
    const toNumber = to.replace('whatsapp:', '');

    // Find the connection matching the To number
    const conn = await this.connections.findOne({
      where: { config: { from_number: to } as any },
    });

    if (!conn) {
      this.logger.warn(`Received WhatsApp message for unknown number ${to}`);
      return;
    }

    await this.messaging.saveMessage({
      advisor_id: conn.advisor_id,
      connection_id: conn.id,
      direction: MessageDirection.INBOUND,
      channel: MessageChannel.WHATSAPP,
      from_address: fromNumber,
      to_address: toNumber,
      body,
      external_message_id: sid,
      thread_id: fromNumber, // Use phone number as thread identifier
      is_read: false,
      sent_at: new Date(),
    });

    // Auto-create a lead if this is a new contact (CRM service injected optionally)
    if (crmService && fromNumber) {
      await this.autoCreateLeadIfNew(conn.advisor_id, fromNumber, crmService);
    }
  }

  private async autoCreateLeadIfNew(advisorId: string, phone: string, crmService: any): Promise<void> {
    try {
      const existing = await crmService.findLeadByPhone?.(advisorId, phone);
      if (existing) return;

      await crmService.createLead(advisorId, {
        first_name: phone,
        last_name: '',
        phone,
        source: LeadSource.WHATSAPP,
        notes: 'Auto-created from inbound WhatsApp message',
      });
    } catch {
      // Non-critical — lead creation failure should not block message storage
    }
  }
}
