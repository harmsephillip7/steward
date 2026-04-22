import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingConnection } from './entities/messaging-connection.entity';
import { Message } from './entities/message.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { EncryptionService } from './encryption.service';
import {
  MessageChannel,
  MessagingConnectionStatus,
  MessageDirection,
  MessageTemplateStatus,
} from '@steward/shared';
import {
  ConnectSmtpDto,
  ConnectWhatsAppDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  ListMessagesDto,
  LinkMessageDto,
} from './dto/messaging.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(MessagingConnection)
    private readonly connections: Repository<MessagingConnection>,

    @InjectRepository(Message)
    private readonly messages: Repository<Message>,

    @InjectRepository(MessageTemplate)
    private readonly templates: Repository<MessageTemplate>,

    private readonly encryption: EncryptionService,
  ) {}

  // ─── Connections ────────────────────────────────────────────────────────────

  async listConnections(advisorId: string): Promise<MessagingConnection[]> {
    return this.connections.find({
      where: { advisor_id: advisorId },
      order: { created_at: 'DESC' },
    });
  }

  async getConnection(id: string, advisorId: string): Promise<MessagingConnection> {
    const conn = await this.connections.findOne({ where: { id, advisor_id: advisorId } });
    if (!conn) throw new NotFoundException('Messaging connection not found');
    return conn;
  }

  async saveSmtpConnection(advisorId: string, dto: ConnectSmtpDto): Promise<MessagingConnection> {
    const credentials = JSON.stringify({
      host: dto.host,
      port: dto.port,
      secure: dto.secure,
      username: dto.username,
      password: dto.password,
      imap_host: dto.imap_host,
      imap_port: dto.imap_port,
    });

    const conn = this.connections.create({
      advisor_id: advisorId,
      channel: MessageChannel.EMAIL,
      provider: 'smtp' as any,
      status: MessagingConnectionStatus.ACTIVE,
      display_name: dto.username,
      encrypted_credentials: this.encryption.encrypt(credentials),
      config: { host: dto.host, port: dto.port, secure: dto.secure },
    });
    return this.connections.save(conn);
  }

  async saveWhatsAppConnection(advisorId: string, dto: ConnectWhatsAppDto): Promise<MessagingConnection> {
    const credentials = JSON.stringify({
      account_sid: dto.account_sid,
      auth_token: dto.auth_token,
      from_number: dto.from_number,
    });

    const conn = this.connections.create({
      advisor_id: advisorId,
      channel: MessageChannel.WHATSAPP,
      provider: dto.provider as any,
      status: MessagingConnectionStatus.ACTIVE,
      display_name: dto.from_number,
      encrypted_credentials: this.encryption.encrypt(credentials),
      config: { from_number: dto.from_number },
    });
    return this.connections.save(conn);
  }

  async disconnectConnection(id: string, advisorId: string): Promise<void> {
    const conn = await this.getConnection(id, advisorId);
    conn.status = MessagingConnectionStatus.DISCONNECTED;
    conn.encrypted_credentials = null;
    await this.connections.save(conn);
  }

  getDecryptedCredentials(conn: MessagingConnection): Record<string, unknown> {
    if (!conn.encrypted_credentials) return {};
    return JSON.parse(this.encryption.decrypt(conn.encrypted_credentials));
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  async listMessages(advisorId: string, dto: ListMessagesDto): Promise<Message[]> {
    const qb = this.messages
      .createQueryBuilder('m')
      .where('m.advisor_id = :advisorId', { advisorId })
      .orderBy('m.sent_at', 'DESC')
      .take(100);

    if (dto.channel) qb.andWhere('m.channel = :channel', { channel: dto.channel });
    if (dto.lead_id) qb.andWhere('m.lead_id = :lead_id', { lead_id: dto.lead_id });
    if (dto.client_id) qb.andWhere('m.client_id = :client_id', { client_id: dto.client_id });
    if (dto.thread_id) qb.andWhere('m.thread_id = :thread_id', { thread_id: dto.thread_id });

    return qb.getMany();
  }

  async markRead(id: string, advisorId: string): Promise<void> {
    await this.messages.update({ id, advisor_id: advisorId }, { is_read: true });
  }

  async linkMessage(id: string, advisorId: string, dto: LinkMessageDto): Promise<Message> {
    const msg = await this.messages.findOne({ where: { id, advisor_id: advisorId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (dto.lead_id !== undefined) msg.lead_id = dto.lead_id;
    if (dto.client_id !== undefined) msg.client_id = dto.client_id;
    return this.messages.save(msg);
  }

  async saveMessage(data: Partial<Message>): Promise<Message> {
    const msg = this.messages.create(data);
    return this.messages.save(msg);
  }

  // ─── Templates ──────────────────────────────────────────────────────────────

  async listTemplates(advisorId: string, channel?: MessageChannel): Promise<MessageTemplate[]> {
    const where: Record<string, unknown> = { advisor_id: advisorId };
    if (channel) where['channel'] = channel;
    return this.templates.find({ where, order: { created_at: 'DESC' } });
  }

  async createTemplate(advisorId: string, dto: CreateTemplateDto): Promise<MessageTemplate> {
    const template = this.templates.create({
      advisor_id: advisorId,
      name: dto.name,
      channel: dto.channel,
      template_name: dto.template_name,
      category: dto.category,
      language: dto.language ?? 'en',
      body: dto.body,
      header_text: dto.header_text ?? null,
      footer_text: dto.footer_text ?? null,
      status: MessageTemplateStatus.DRAFT,
    });
    return this.templates.save(template);
  }

  async updateTemplate(id: string, advisorId: string, dto: UpdateTemplateDto): Promise<MessageTemplate> {
    const template = await this.templates.findOne({ where: { id, advisor_id: advisorId } });
    if (!template) throw new NotFoundException('Template not found');
    Object.assign(template, dto);
    return this.templates.save(template);
  }

  async deleteTemplate(id: string, advisorId: string): Promise<void> {
    await this.templates.delete({ id, advisor_id: advisorId });
  }

  async getUnreadCount(advisorId: string): Promise<number> {
    return this.messages.count({
      where: { advisor_id: advisorId, is_read: false, direction: MessageDirection.INBOUND },
    });
  }
}
