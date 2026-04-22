import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Query,
  Req,
  RawBodyRequest,
  Res,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { MetaService } from './meta.service';
import { WhatsAppService } from './whatsapp.service';
import { EmailService } from './email.service';
import { MessagingService } from './messaging.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingConnection } from './entities/messaging-connection.entity';
import { MessagingProvider } from '@steward/shared';
import { CrmService } from '../crm/crm.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly meta: MetaService,
    private readonly whatsapp: WhatsAppService,
    private readonly email: EmailService,
    private readonly messaging: MessagingService,
    private readonly crm: CrmService,
    @InjectRepository(MessagingConnection)
    private readonly connections: Repository<MessagingConnection>,
  ) {}

  // ─── Meta Webhook Verification ───────────────────────────────────────────────

  @Get('meta')
  verifyMeta(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const result = this.meta.verifyWebhook(mode, token, challenge);
    return res.status(200).send(result);
  }

  // ─── Meta Webhook Events ─────────────────────────────────────────────────────

  @Post('meta')
  @HttpCode(200)
  async handleMetaEvent(@Body() body: any) {
    await this.meta.handleWebhookEvent(body, this.crm);
    return { received: true };
  }

  // ─── Gmail Push Notification ─────────────────────────────────────────────────

  @Post('gmail')
  @HttpCode(200)
  async handleGmailPush(@Body() body: any) {
    // Google Pub/Sub sends: { message: { data: base64 }, subscription: '...' }
    try {
      const raw = Buffer.from(body?.message?.data ?? '', 'base64').toString('utf8');
      const data = JSON.parse(raw);
      const emailAddress: string = data.emailAddress;
      const historyId: string = String(data.historyId);

      if (emailAddress && historyId) {
        const conn = await this.connections.findOne({
          where: { provider: MessagingProvider.GMAIL, display_name: emailAddress },
        });
        if (conn) {
          await this.email.handleGmailPush(conn.advisor_id, conn, historyId);
        }
      }
    } catch {
      // Silently ignore malformed push notifications
    }
    return { received: true };
  }

  // ─── Twilio WhatsApp ─────────────────────────────────────────────────────────

  @Post('whatsapp')
  @HttpCode(200)
  async handleWhatsAppMessage(
    @Req() req: Request,
    @Headers('x-twilio-signature') signature: string,
    @Body() body: Record<string, string>,
  ) {
    // Validate Twilio signature
    const toNumber = body['To'];
    if (toNumber) {
      const conn = await this.connections.findOne({
        where: { provider: MessagingProvider.TWILIO },
      });
      if (conn) {
        const creds = this.messaging.getDecryptedCredentials(conn);
        const authToken = creds['auth_token'] as string;
        const url = `https://stewardapi-production.up.railway.app/webhooks/whatsapp`;
        const valid = this.whatsapp.validateTwilioSignature(url, body, signature, authToken);
        if (!valid) {
          return { error: 'Invalid signature' };
        }
      }
    }

    await this.whatsapp.handleInboundMessage(body, this.crm);

    // Return Twilio-compatible empty TwiML response
    return `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  }

  @Get('whatsapp')
  @HttpCode(200)
  whatsAppStatus() {
    // Twilio status callback URL
    return 'OK';
  }
}
