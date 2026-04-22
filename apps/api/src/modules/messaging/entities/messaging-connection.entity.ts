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
  MessagingProvider,
  MessagingConnectionStatus,
} from '@steward/shared';

@Entity('messaging_connections')
@Index(['advisor_id', 'channel'])
export class MessagingConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  advisor_id: string;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ type: 'enum', enum: MessageChannel })
  channel: MessageChannel;

  @Column({ type: 'enum', enum: MessagingProvider })
  provider: MessagingProvider;

  @Column({
    type: 'enum',
    enum: MessagingConnectionStatus,
    default: MessagingConnectionStatus.PENDING,
  })
  status: MessagingConnectionStatus;

  /** Human-readable label: email address, page name, WhatsApp number */
  @Column({ type: 'varchar', length: 255, nullable: true })
  display_name: string | null;

  /** Encrypted credentials stored as AES-256-GCM ciphertext (hex iv:tag:ciphertext) */
  @Column({ type: 'text', nullable: true })
  encrypted_credentials: string | null;

  /** Non-sensitive configuration (page id, webhook subscriptions, etc.) */
  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  last_synced_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
