import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { google } from 'googleapis';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-client';
import { MessagingService } from './messaging.service';
import { MessagingConnection } from './entities/messaging-connection.entity';
import { MessageChannel, MessageDirection, MessagingProvider, MessagingConnectionStatus } from '@steward/shared';
import { SendEmailDto } from './dto/messaging.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly messaging: MessagingService,
    @InjectRepository(MessagingConnection)
    private readonly connections: Repository<MessagingConnection>,
  ) {}

  // ─── Gmail OAuth ─────────────────────────────────────────────────────────────

  getGmailAuthUrl(advisorId: string): string {
    const oauth2 = this.createGoogleOAuth2();
    return oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
      state: advisorId,
    });
  }

  async handleGmailCallback(code: string, advisorId: string): Promise<MessagingConnection> {
    const oauth2 = this.createGoogleOAuth2();
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const email = profile.data.emailAddress ?? 'Gmail account';

    const credentials = JSON.stringify(tokens);
    const existing = await this.connections.findOne({
      where: { advisor_id: advisorId, provider: MessagingProvider.GMAIL },
    });

    const conn = existing ?? this.connections.create({ advisor_id: advisorId });
    conn.channel = MessageChannel.EMAIL;
    conn.provider = MessagingProvider.GMAIL;
    conn.status = MessagingConnectionStatus.ACTIVE;
    conn.display_name = email;
    conn.encrypted_credentials = this.messaging['encryption'].encrypt(credentials);
    return this.connections.save(conn);
  }

  // ─── Microsoft OAuth ──────────────────────────────────────────────────────────

  getMicrosoftAuthUrl(advisorId: string): string {
    const clientId = this.config.getOrThrow<string>('MICROSOFT_CLIENT_ID');
    const redirectUri = this.config.getOrThrow<string>('MICROSOFT_REDIRECT_URI');
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'Mail.Read Mail.Send Mail.ReadWrite offline_access',
      response_mode: 'query',
      state: advisorId,
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
  }

  async handleMicrosoftCallback(code: string, advisorId: string): Promise<MessagingConnection> {
    const clientId = this.config.getOrThrow<string>('MICROSOFT_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('MICROSOFT_CLIENT_SECRET');
    const redirectUri = this.config.getOrThrow<string>('MICROSOFT_REDIRECT_URI');

    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new BadRequestException('Failed to exchange Microsoft authorization code');
    }

    const tokens = await tokenRes.json();
    const client = MicrosoftGraph.Client.init({
      authProvider: (done) => done(null, tokens.access_token),
    });
    const me = await client.api('/me').get();
    const email: string = me.mail ?? me.userPrincipalName ?? 'Outlook account';

    const existing = await this.connections.findOne({
      where: { advisor_id: advisorId, provider: MessagingProvider.MICROSOFT },
    });
    const conn = existing ?? this.connections.create({ advisor_id: advisorId });
    conn.channel = MessageChannel.EMAIL;
    conn.provider = MessagingProvider.MICROSOFT;
    conn.status = MessagingConnectionStatus.ACTIVE;
    conn.display_name = email;
    conn.encrypted_credentials = this.messaging['encryption'].encrypt(JSON.stringify(tokens));
    return this.connections.save(conn);
  }

  // ─── Sending ──────────────────────────────────────────────────────────────────

  async sendEmail(advisorId: string, dto: SendEmailDto): Promise<void> {
    const conn = await this.messaging.getConnection(dto.connection_id, advisorId);
    const creds = this.messaging.getDecryptedCredentials(conn);

    if (conn.provider === MessagingProvider.GMAIL) {
      await this.sendViaGmail(conn, creds, dto);
    } else if (conn.provider === MessagingProvider.MICROSOFT) {
      await this.sendViaMicrosoft(conn, creds, dto);
    } else {
      await this.sendViaSmtp(conn, creds, dto);
    }

    await this.messaging.saveMessage({
      advisor_id: advisorId,
      connection_id: conn.id,
      direction: MessageDirection.OUTBOUND,
      channel: MessageChannel.EMAIL,
      lead_id: dto.lead_id ?? null,
      client_id: dto.client_id ?? null,
      from_address: conn.display_name ?? '',
      to_address: dto.to,
      subject: dto.subject,
      body: dto.body,
      thread_id: dto.thread_id ?? null,
      in_reply_to: dto.in_reply_to ?? null,
      is_read: true,
      sent_at: new Date(),
    });
  }

  private async sendViaGmail(
    conn: MessagingConnection,
    creds: Record<string, unknown>,
    dto: SendEmailDto,
  ): Promise<void> {
    const oauth2 = this.createGoogleOAuth2();
    oauth2.setCredentials(creds as any);
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    const headers = [
      `To: ${dto.to}`,
      `Subject: ${dto.subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      `MIME-Version: 1.0`,
    ];
    if (dto.in_reply_to) headers.push(`In-Reply-To: ${dto.in_reply_to}`);
    if (dto.thread_id) headers.push(`References: ${dto.in_reply_to ?? dto.thread_id}`);

    const raw = Buffer.from(`${headers.join('\r\n')}\r\n\r\n${dto.body}`)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        threadId: dto.thread_id ?? undefined,
      },
    });
  }

  private async sendViaMicrosoft(
    conn: MessagingConnection,
    creds: Record<string, unknown>,
    dto: SendEmailDto,
  ): Promise<void> {
    let accessToken = creds['access_token'] as string;

    // Refresh if expired
    if (creds['refresh_token']) {
      accessToken = await this.refreshMicrosoftToken(creds);
    }

    const client = MicrosoftGraph.Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    await client.api('/me/sendMail').post({
      message: {
        subject: dto.subject,
        body: { contentType: 'Text', content: dto.body },
        toRecipients: [{ emailAddress: { address: dto.to } }],
      },
    });
  }

  private async sendViaSmtp(
    conn: MessagingConnection,
    creds: Record<string, unknown>,
    dto: SendEmailDto,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: creds['host'] as string,
      port: creds['port'] as number,
      secure: creds['secure'] as boolean,
      auth: { user: creds['username'] as string, pass: creds['password'] as string },
    });
    await transporter.sendMail({
      from: conn.display_name ?? (creds['username'] as string),
      to: dto.to,
      subject: dto.subject,
      text: dto.body,
      inReplyTo: dto.in_reply_to,
      references: dto.in_reply_to,
    });
  }

  // ─── IMAP Polling ────────────────────────────────────────────────────────────

  async pollSmtpInbox(conn: MessagingConnection): Promise<void> {
    const creds = this.messaging.getDecryptedCredentials(conn);
    const host = (creds['imap_host'] as string) ?? (creds['host'] as string);
    const port = (creds['imap_port'] as number) ?? 993;
    const username = creds['username'] as string;
    const password = creds['password'] as string;

    const client = new ImapFlow({
      host,
      port,
      secure: true,
      auth: { user: username, pass: password },
      logger: false,
    });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      try {
        // Fetch last 50 unseen messages
        for await (const msg of client.fetch('1:50', {
          envelope: true,
          source: true,
          flags: true,
        })) {
          if (msg.flags?.has('\\Seen')) continue;

          const envelope = msg.envelope;
          const from = envelope?.from?.[0]?.address ?? '';
          const subject = envelope?.subject ?? null;
          const threadId = envelope?.inReplyTo ?? envelope?.messageId ?? null;

          await this.messaging.saveMessage({
            advisor_id: conn.advisor_id,
            connection_id: conn.id,
            direction: MessageDirection.INBOUND,
            channel: MessageChannel.EMAIL,
            from_address: from,
            to_address: conn.display_name ?? username,
            subject,
            body: msg.source?.toString() ?? '',
            thread_id: threadId,
            external_message_id: envelope?.messageId ?? null,
            in_reply_to: envelope?.inReplyTo ?? null,
            is_read: false,
            sent_at: envelope?.date ?? new Date(),
          });
        }
      } finally {
        lock.release();
      }
      await client.logout();
    } catch (err) {
      this.logger.error(`IMAP poll failed for connection ${conn.id}: ${(err as Error).message}`);
    }

    await this.connections.update(conn.id, { last_synced_at: new Date() });
  }

  // ─── Gmail Push Notifications (webhook) ─────────────────────────────────────

  async handleGmailPush(advisorId: string, conn: MessagingConnection, historyId: string): Promise<void> {
    const creds = this.messaging.getDecryptedCredentials(conn);
    const oauth2 = this.createGoogleOAuth2();
    oauth2.setCredentials(creds as any);
    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    const history = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: historyId,
      historyTypes: ['messageAdded'],
    });

    const messageIds: string[] = [];
    for (const record of history.data.history ?? []) {
      for (const added of record.messagesAdded ?? []) {
        if (added.message?.id) messageIds.push(added.message.id);
      }
    }

    for (const msgId of messageIds) {
      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: msgId,
        format: 'full',
      });

      const headers = msgData.data.payload?.headers ?? [];
      const get = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null;

      const from = get('From') ?? '';
      const to = get('To') ?? conn.display_name ?? '';
      const subject = get('Subject');
      const messageId = get('Message-ID');
      const inReplyTo = get('In-Reply-To');
      const threadId = msgData.data.threadId ?? null;
      const body = this.extractGmailBody(msgData.data.payload);

      await this.messaging.saveMessage({
        advisor_id: advisorId,
        connection_id: conn.id,
        direction: MessageDirection.INBOUND,
        channel: MessageChannel.EMAIL,
        from_address: from,
        to_address: to,
        subject,
        body,
        thread_id: threadId,
        external_message_id: messageId,
        in_reply_to: inReplyTo,
        is_read: false,
        sent_at: new Date(parseInt(msgData.data.internalDate ?? '0')),
      });
    }

    await this.connections.update(conn.id, { last_synced_at: new Date() });
  }

  private extractGmailBody(payload: any): string {
    if (!payload) return '';
    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf8');
    }
    for (const part of payload.parts ?? []) {
      const result = this.extractGmailBody(part);
      if (result) return result;
    }
    return '';
  }

  private async refreshMicrosoftToken(creds: Record<string, unknown>): Promise<string> {
    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID') ?? '';
    const clientSecret = this.config.get<string>('MICROSOFT_CLIENT_SECRET') ?? '';
    const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: creds['refresh_token'] as string,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const tokens = await res.json();
    return tokens.access_token as string;
  }

  private createGoogleOAuth2() {
    return new google.auth.OAuth2(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
    );
  }
}
