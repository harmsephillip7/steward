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
import { RiskProfile, TaxResidency, MaritalStatus, EmploymentStatus, HealthStatus } from '@steward/shared';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { Portfolio } from '../../portfolios/entities/portfolio.entity';
import { RecordOfAdvice } from '../../compliance/entities/record-of-advice.entity';
import { Dependent } from './dependent.entity';
import { ClientAsset } from './client-asset.entity';
import { Liability } from './liability.entity';
import { InsurancePolicy } from './insurance-policy.entity';
import { FinancialGoal } from './financial-goal.entity';
import { LifeEvent } from './life-event.entity';
import { IncomeExpense } from './income-expense.entity';

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

  // ── Extended profile fields ──────────────────────────────────────

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  marital_status: MaritalStatus;

  @Column({ nullable: true })
  spouse_name: string;

  @Column({ nullable: true })
  spouse_id_number: string;

  @Column({ type: 'date', nullable: true })
  spouse_dob: Date;

  @Column({ type: 'enum', enum: EmploymentStatus, nullable: true })
  employment_status: EmploymentStatus;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  employer: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ type: 'int', nullable: true })
  retirement_age_target: number;

  @Column({ nullable: true })
  smoker: boolean;

  @Column({ type: 'enum', enum: HealthStatus, nullable: true })
  health_status: HealthStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  annual_gross_income: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ── Relations ────────────────────────────────────────────────────

  @OneToMany(() => Portfolio, (p) => p.client)
  portfolios: Portfolio[];

  @OneToMany(() => RecordOfAdvice, (r) => r.client)
  records_of_advice: RecordOfAdvice[];

  @OneToMany(() => Dependent, (d) => d.client)
  dependents: Dependent[];

  @OneToMany(() => ClientAsset, (a) => a.client)
  assets: ClientAsset[];

  @OneToMany(() => Liability, (l) => l.client)
  liabilities: Liability[];

  @OneToMany(() => InsurancePolicy, (p) => p.client)
  insurance_policies: InsurancePolicy[];

  @OneToMany(() => FinancialGoal, (g) => g.client)
  financial_goals: FinancialGoal[];

  @OneToMany(() => LifeEvent, (e) => e.client)
  life_events: LifeEvent[];

  @OneToMany(() => IncomeExpense, (ie) => ie.client)
  income_expenses: IncomeExpense[];
}
