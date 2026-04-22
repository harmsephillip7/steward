import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagingService } from './messaging.service';
import { EmailService } from './email.service';
import { MetaService } from './meta.service';
import { WhatsAppService } from './whatsapp.service';
import {
  ConnectSmtpDto,
  ConnectWhatsAppDto,
  SendEmailDto,
  SendMessengerDto,
  SendWhatsAppDto,
  ListMessagesDto,
  LinkMessageDto,
  CreateTemplateDto,
  UpdateTemplateDto,
} from './dto/messaging.dto';
import { MessageChannel } from '@steward/shared';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagingController {
  constructor(
    private readonly messaging: MessagingService,
    private readonly email: EmailService,
    private readonly meta: MetaService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  // ─── Connection management ────────────────────────────────────────────────────

  @Get('integrations/connections')
  listConnections(@Request() req: any) {
    return this.messaging.listConnections(req.user.id);
  }

  @Delete('integrations/connections/:id')
  disconnect(@Request() req: any, @Param('id') id: string) {
    return this.messaging.disconnectConnection(id, req.user.id);
  }

  // ─── Email — OAuth ────────────────────────────────────────────────────────────

  @Get('integrations/email/gmail/connect')
  gmailConnect(@Request() req: any, @Res() res: Response) {
    const url = this.email.getGmailAuthUrl(req.user.id);
    return res.redirect(url);
  }

  @Get('integrations/email/gmail/callback')
  async gmailCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    await this.email.handleGmailCallback(code, state);
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    return res.redirect(`${appUrl}/integrations?connected=gmail`);
  }

  @Get('integrations/email/microsoft/connect')
  microsoftConnect(@Request() req: any, @Res() res: Response) {
    const url = this.email.getMicrosoftAuthUrl(req.user.id);
    return res.redirect(url);
  }

  @Get('integrations/email/microsoft/callback')
  async microsoftCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    await this.email.handleMicrosoftCallback(code, state);
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    return res.redirect(`${appUrl}/integrations?connected=microsoft`);
  }

  // ─── Email — SMTP ─────────────────────────────────────────────────────────────

  @Post('integrations/email/smtp/connect')
  connectSmtp(@Request() req: any, @Body() dto: ConnectSmtpDto) {
    return this.messaging.saveSmtpConnection(req.user.id, dto);
  }

  // ─── Meta / Facebook ──────────────────────────────────────────────────────────

  @Get('integrations/meta/connect')
  metaConnect(@Request() req: any, @Res() res: Response) {
    const url = this.meta.getAuthUrl(req.user.id);
    return res.redirect(url);
  }

  @Get('integrations/meta/callback')
  async metaCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    await this.meta.handleCallback(code, state);
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    return res.redirect(`${appUrl}/integrations?connected=meta`);
  }

  @Get('integrations/meta/:connectionId/pages')
  async metaPages(@Request() req: any, @Param('connectionId') connectionId: string) {
    const conn = await this.messaging.getConnection(connectionId, req.user.id);
    return this.meta.getPages(conn);
  }

  @Post('integrations/meta/:connectionId/subscribe/:pageId')
  async metaSubscribePage(
    @Request() req: any,
    @Param('connectionId') connectionId: string,
    @Param('pageId') pageId: string,
  ) {
    const conn = await this.messaging.getConnection(connectionId, req.user.id);
    await this.meta.subscribePage(conn, pageId);
    return { success: true };
  }

  // ─── WhatsApp ─────────────────────────────────────────────────────────────────

  @Post('integrations/whatsapp/connect')
  connectWhatsApp(@Request() req: any, @Body() dto: ConnectWhatsAppDto) {
    return this.messaging.saveWhatsAppConnection(req.user.id, dto);
  }

  @Get('integrations/whatsapp/:connectionId/webhook-url')
  getWhatsAppWebhookUrl() {
    return { url: this.whatsapp.getWebhookUrl() };
  }

  @Get('integrations/whatsapp/:connectionId/verify')
  async verifyWhatsApp(@Request() req: any, @Param('connectionId') connectionId: string) {
    const conn = await this.messaging.getConnection(connectionId, req.user.id);
    const alive = await this.whatsapp.verifyConnection(conn);
    return { connected: alive };
  }

  // ─── Messages ─────────────────────────────────────────────────────────────────

  @Get('messages')
  listMessages(@Request() req: any, @Query() query: ListMessagesDto) {
    return this.messaging.listMessages(req.user.id, query);
  }

  @Get('messages/unread-count')
  getUnreadCount(@Request() req: any) {
    return this.messaging.getUnreadCount(req.user.id);
  }

  @Post('messages/email/send')
  sendEmail(@Request() req: any, @Body() dto: SendEmailDto) {
    return this.email.sendEmail(req.user.id, dto);
  }

  @Post('messages/messenger/send')
  async sendMessenger(@Request() req: any, @Body() dto: SendMessengerDto) {
    const conn = await this.messaging.getConnection(dto.connection_id, req.user.id);
    await this.meta.sendMessengerMessage(conn, dto.recipient_psid, dto.text);
    await this.messaging.saveMessage({
      advisor_id: req.user.id,
      connection_id: conn.id,
      direction: 'outbound' as any,
      channel: MessageChannel.MESSENGER,
      from_address: conn.display_name ?? '',
      to_address: dto.recipient_psid,
      body: dto.text,
      thread_id: dto.recipient_psid,
      lead_id: dto.lead_id ?? null,
      client_id: dto.client_id ?? null,
      is_read: true,
      sent_at: new Date(),
    });
    return { success: true };
  }

  @Post('messages/whatsapp/send')
  async sendWhatsApp(@Request() req: any, @Body() dto: SendWhatsAppDto) {
    const conn = await this.messaging.getConnection(dto.connection_id, req.user.id);
    await this.whatsapp.sendMessage(conn, dto.to, dto.body);
    await this.messaging.saveMessage({
      advisor_id: req.user.id,
      connection_id: conn.id,
      direction: 'outbound' as any,
      channel: MessageChannel.WHATSAPP,
      from_address: conn.display_name ?? '',
      to_address: dto.to,
      body: dto.body,
      thread_id: dto.to,
      lead_id: dto.lead_id ?? null,
      client_id: dto.client_id ?? null,
      is_read: true,
      sent_at: new Date(),
    });
    return { success: true };
  }

  @Patch('messages/:id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.messaging.markRead(id, req.user.id);
  }

  @Patch('messages/:id/link')
  linkMessage(@Request() req: any, @Param('id') id: string, @Body() dto: LinkMessageDto) {
    return this.messaging.linkMessage(id, req.user.id, dto);
  }

  // ─── Templates ────────────────────────────────────────────────────────────────

  @Get('message-templates')
  listTemplates(@Request() req: any, @Query('channel') channel?: MessageChannel) {
    return this.messaging.listTemplates(req.user.id, channel);
  }

  @Post('message-templates')
  createTemplate(@Request() req: any, @Body() dto: CreateTemplateDto) {
    return this.messaging.createTemplate(req.user.id, dto);
  }

  @Patch('message-templates/:id')
  updateTemplate(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.messaging.updateTemplate(id, req.user.id, dto);
  }

  @Delete('message-templates/:id')
  deleteTemplate(@Request() req: any, @Param('id') id: string) {
    return this.messaging.deleteTemplate(id, req.user.id);
  }
}
