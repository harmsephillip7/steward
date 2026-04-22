import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { MessagingConnection } from './messaging-connection.entity';
import { MessageChannel, MessageDirection } from '@steward/shared';

@Entity('messages')
@Index(['advisor_id', 'channel'])
@Index(['advisor_id', 'thread_id'])
@Index(['lead_id'])
@Index(['client_id'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  advisor_id: string;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ type: 'uuid' })
  connection_id: string;

  @ManyToOne(() => MessagingConnection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connection_id' })
  connection: MessagingConnection;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @Column({ type: 'enum', enum: MessageChannel })
  channel: MessageChannel;

  /** CRM lead link (optional) */
  @Column({ type: 'uuid', nullable: true })
  lead_id: string | null;

  /** Client link (optional) */
  @Column({ type: 'uuid', nullable: true })
  client_id: string | null;

  @Column({ type: 'varchar', length: 500 })
  from_address: string;

  @Column({ type: 'varchar', length: 500 })
  to_address: string;

  @Column({ type: 'varchar', length: 998, nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  body: string;

  /** Groups messages into a conversation thread */
  @Column({ type: 'varchar', length: 500, nullable: true })
  thread_id: string | null;

  /** Provider's own message id (email Message-ID header, Messenger mid, etc.) */
  @Column({ type: 'varchar', length: 500, nullable: true })
  external_message_id: string | null;

  /** In-Reply-To header value (email only, for threading) */
  @Column({ type: 'varchar', length: 500, nullable: true })
  in_reply_to: string | null;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'timestamptz' })
  sent_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
