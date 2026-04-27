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

/** A stub for sanctions/PEP screening — actual screening providers wired later. */
@Entity('sanctions_screens')
@Index(['advisor_id', 'screened_at'])
export class SanctionsScreen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor?: Advisor;

  @Column({ nullable: true })
  client_id: string;

  @Column({ length: 64 })
  subject_name: string;

  @Column({ length: 32, nullable: true })
  subject_id_or_passport: string;

  @Column({ length: 32 })
  status: 'clear' | 'review' | 'match' | 'pending' | 'error';

  @Column({ type: 'jsonb', nullable: true })
  matches: Array<Record<string, unknown>>;

  /** PEP exposure detected. */
  @Column({ default: false })
  pep_detected: boolean;

  /** Sanctions list hit (UN, OFAC, EU, FIC). */
  @Column({ default: false })
  sanctions_hit: boolean;

  @Column({ length: 64, nullable: true })
  provider: string;

  @Column({ type: 'jsonb', nullable: true })
  raw_response: Record<string, unknown>;

  @Column({ type: 'timestamp' })
  screened_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
