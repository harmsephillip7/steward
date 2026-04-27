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

/** A single CPD activity logged by an advisor. */
@Entity('cpd_records')
@Index(['advisor_id', 'completed_at'])
export class CpdRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor?: Advisor;

  /** e.g. 'webinar', 'course', 'self-study', 'conference'. */
  @Column({ length: 32 })
  activity_type: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  provider: string;

  /** Verifiable / non-verifiable per FSCA CPD rules. */
  @Column({ default: true })
  verifiable: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hours: number;

  @Column({ type: 'date' })
  completed_at: Date;

  /** Optional certificate / evidence document key (StorageService). */
  @Column({ nullable: true })
  evidence_key: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
