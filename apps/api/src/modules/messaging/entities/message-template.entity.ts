import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Advisor } from '../../advisors/entities/advisor.entity';
import {
  MessageChannel,
  MessageTemplateStatus,
  MessageTemplateCategory,
} from '@steward/shared';

@Entity('message_templates')
@Index(['advisor_id', 'channel'])
export class MessageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  advisor_id: string;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  /** Friendly name shown in the app (e.g. "Follow-up after meeting") */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: MessageChannel })
  channel: MessageChannel;

  /**
   * WhatsApp template name registered with Meta/Twilio (snake_case, no spaces).
   * For email/Messenger this stores a short identifier.
   */
  @Column({ type: 'varchar', length: 255 })
  template_name: string;

  @Column({
    type: 'enum',
    enum: MessageTemplateCategory,
    default: MessageTemplateCategory.UTILITY,
  })
  category: MessageTemplateCategory;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  /** Template body. May contain {{1}} {{2}} placeholders for WhatsApp */
  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  header_text: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  footer_text: string | null;

  @Column({
    type: 'enum',
    enum: MessageTemplateStatus,
    default: MessageTemplateStatus.DRAFT,
  })
  status: MessageTemplateStatus;

  /** Template SID from Twilio or template id from Meta */
  @Column({ type: 'varchar', length: 255, nullable: true })
  external_template_id: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
