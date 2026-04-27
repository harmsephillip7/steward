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
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

export type ReportType =
  | 'roa'
  | 'fna'
  | 'replacement_comparison'
  | 'annual_review'
  | 'portfolio_screening'
  | 'tax_pack'
  | 'fee_disclosure'
  | 'coi_disclosure'
  | 'statement_of_intent';

export type ReportStatus =
  | 'draft'
  | 'finalised'
  | 'sent_to_client'
  | 'accepted'
  | 'declined'
  | 'expired';

@Entity('reports')
@Index(['advisor_id', 'created_at'])
@Index(['client_id', 'type'])
export class Report {
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

  @Column({ type: 'varchar', length: 32 })
  type: ReportType;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: ReportStatus;

  @Column({ type: 'integer', default: 1 })
  version: number;

  /** Title shown to advisor + client. */
  @Column()
  title: string;

  /** Inputs that produced the report — used to regenerate / re-render. */
  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  /** Stable storage key (R2 / local) for the rendered PDF. */
  @Column({ nullable: true })
  pdf_key: string;

  /** Public-ish URL, may be a signed URL or a route. */
  @Column({ nullable: true })
  pdf_url: string;

  /** sha256 of the rendered PDF, used to prove the doc the client signed. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  pdf_sha256: string;

  /** When advisor finalised / locked the document for sending. */
  @Column({ type: 'timestamp', nullable: true })
  finalised_at: Date;

  /** When sent to client (portal or messaging). */
  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  /** When client accepted / declined. */
  @Column({ type: 'timestamp', nullable: true })
  decided_at: Date;

  /** Captured signature evidence (typed name, IP, UA, signature provider id). */
  @Column({ type: 'jsonb', nullable: true })
  signature: Record<string, unknown>;

  /** SigniFlow envelope id when AES is required. */
  @Column({ nullable: true })
  signiflow_envelope_id: string;

  /** Optional decline reason. */
  @Column({ type: 'text', nullable: true })
  decline_reason: string;

  /** Free-form notes (advisor private). */
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
