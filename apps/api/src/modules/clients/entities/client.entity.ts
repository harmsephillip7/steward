import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RiskProfile, TaxResidency } from '@steward/shared';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { Portfolio } from '../../portfolios/entities/portfolio.entity';
import { RecordOfAdvice } from '../../compliance/entities/record-of-advice.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor, (advisor) => advisor.clients)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true, nullable: true })
  id_number: string;

  @Column({ nullable: true })
  tax_number: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'enum', enum: RiskProfile, nullable: true })
  risk_profile: RiskProfile;

  @Column({ type: 'enum', enum: TaxResidency, default: TaxResidency.SA_RESIDENT })
  tax_residency: TaxResidency;

  @Column({ default: false })
  kyc_complete: boolean;

  @Column({ default: false })
  fica_complete: boolean;

  @Column({ default: false })
  source_of_wealth_declared: boolean;

  @Column({ default: false })
  risk_profile_complete: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Portfolio, (p) => p.client)
  portfolios: Portfolio[];

  @OneToMany(() => RecordOfAdvice, (r) => r.client)
  records_of_advice: RecordOfAdvice[];
}
