import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { Client } from '../../clients/entities/client.entity';

export type ComplaintStatus =
  | 'received'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'rejected'
  | 'escalated_to_ombud';

export type ComplaintCategory =
  | 'advice'
  | 'service'
  | 'product'
  | 'fees'
  | 'disclosure'
  | 'other';

/**
 * Complaints register per FSCA Complaints Resolution requirements.
 * FAIS Ombud has jurisdiction once 6 weeks have passed without resolution.
 */
@Entity('complaints')
@Index(['advisor_id', 'received_at'])
@Index(['status'])
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor?: Advisor;

  @Column({ nullable: true })
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client?: Client;

  @Column()
  complainant_name: string;

  @Column({ nullable: true })
  complainant_contact: string;

  @Column({ type: 'varchar', length: 32 })
  category: ComplaintCategory;

  @Column({ type: 'varchar', length: 32, default: 'received' })
  status: ComplaintStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: Array<{ key: string; description: string }>;

  @Column({ type: 'timestamp' })
  received_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  /** Set when 6 weeks passes without resolution → flag for FAIS Ombud. */
  @Column({ default: false })
  ombud_eligible: boolean;

  @Column({ type: 'text', nullable: true })
  resolution_summary: string;

  @Column({ type: 'jsonb', nullable: true })
  remedy: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
