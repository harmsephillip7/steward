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

/**
 * Fit & Proper Determination 2017 — evidence of competence, honesty, integrity,
 * solvency, operational ability per FSCA. Each row is a periodic attestation.
 */
@Entity('fit_and_proper_records')
@Index(['advisor_id', 'period_end'])
export class FitAndProperRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor?: Advisor;

  @Column({ type: 'date' })
  period_start: Date;

  @Column({ type: 'date' })
  period_end: Date;

  /** Honesty & integrity declaration. */
  @Column({ default: false })
  honesty_integrity_declared: boolean;

  /** Solvency declaration (no provisional sequestration / liquidation orders). */
  @Column({ default: false })
  solvency_declared: boolean;

  /** Personal character declaration. */
  @Column({ default: false })
  personal_character_declared: boolean;

  /** Continuous PI cover in force. */
  @Column({ default: false })
  pi_cover_in_force: boolean;

  /** Operational ability (systems, supervision). */
  @Column({ default: false })
  operational_ability_confirmed: boolean;

  /** Qualifications met for product categories advised on. */
  @Column({ type: 'jsonb', nullable: true })
  qualifications_evidence: Record<string, unknown>;

  /** RE 1 / RE 5 status. */
  @Column({ nullable: true })
  re1_status: string; // 'passed' | 'pending' | 'na'

  @Column({ nullable: true })
  re5_status: string;

  /** CPD hours achieved this period. */
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  cpd_hours_achieved: number;

  /** CPD hours required (FAIS — typically 18 hours per cycle). */
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 18 })
  cpd_hours_required: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  attested: boolean;

  @Column({ type: 'timestamp', nullable: true })
  attested_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
