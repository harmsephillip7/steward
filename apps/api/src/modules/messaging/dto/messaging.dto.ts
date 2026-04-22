import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import {
  MessageChannel,
  MessagingProvider,
  MessageTemplateCategory,
} from '@steward/shared';

// ─── Connection DTOs ──────────────────────────────────────────────────────────

export class ConnectSmtpDto {
  @IsString() @IsNotEmpty() host: string;
  @IsInt() @Min(1) @Max(65535) port: number;
  @IsBoolean() secure: boolean;
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() password: string;
  /** Optional IMAP host if different from SMTP host */
  @IsOptional() @IsString() imap_host?: string;
  @IsOptional() @IsInt() @Min(1) @Max(65535) imap_port?: number;
}

export class ConnectWhatsAppDto {
  @IsIn(['twilio', 'meta_whatsapp']) provider: 'twilio' | 'meta_whatsapp';
  /** Twilio Account SID or Meta Phone Number ID */
  @IsString() @IsNotEmpty() account_sid: string;
  /** Twilio Auth Token or Meta API token */
  @IsString() @IsNotEmpty() auth_token: string;
  /** e.g. whatsapp:+27820000000 (Twilio) or +27820000000 (Meta) */
  @IsString() @IsNotEmpty() from_number: string;
}

// ─── Messaging DTOs ───────────────────────────────────────────────────────────

export class SendEmailDto {
  @IsUUID() connection_id: string;
  @IsEmail() to: string;
  @IsString() @IsNotEmpty() subject: string;
  @IsString() @IsNotEmpty() body: string;
  @IsOptional() @IsString() in_reply_to?: string;
  @IsOptional() @IsString() thread_id?: string;
  @IsOptional() @IsUUID() lead_id?: string;
  @IsOptional() @IsUUID() client_id?: string;
}

export class SendMessengerDto {
  @IsUUID() connection_id: string;
  /** Facebook PSID of the recipient */
  @IsString() @IsNotEmpty() recipient_psid: string;
  @IsString() @IsNotEmpty() text: string;
  @IsOptional() @IsUUID() lead_id?: string;
  @IsOptional() @IsUUID() client_id?: string;
}

export class SendWhatsAppDto {
  @IsUUID() connection_id: string;
  /** Recipient phone number with country code e.g. +27821234567 */
  @IsString() @IsNotEmpty() to: string;
  @IsString() @IsNotEmpty() body: string;
  @IsOptional() @IsString() template_id?: string;
  @IsOptional() @IsUUID() lead_id?: string;
  @IsOptional() @IsUUID() client_id?: string;
}

export class LinkMessageDto {
  @IsOptional() @IsUUID() lead_id?: string;
  @IsOptional() @IsUUID() client_id?: string;
}

export class ListMessagesDto {
  @IsOptional() @IsEnum(MessageChannel) channel?: MessageChannel;
  @IsOptional() @IsUUID() lead_id?: string;
  @IsOptional() @IsUUID() client_id?: string;
  @IsOptional() @IsString() thread_id?: string;
}

// ─── Template DTOs ────────────────────────────────────────────────────────────

export class CreateTemplateDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEnum(MessageChannel) channel: MessageChannel;
  @IsString() @IsNotEmpty() template_name: string;
  @IsEnum(MessageTemplateCategory) category: MessageTemplateCategory;
  @IsOptional() @IsString() language?: string;
  @IsString() @IsNotEmpty() body: string;
  @IsOptional() @IsString() header_text?: string;
  @IsOptional() @IsString() footer_text?: string;
}

export class UpdateTemplateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() header_text?: string;
  @IsOptional() @IsString() footer_text?: string;
}
