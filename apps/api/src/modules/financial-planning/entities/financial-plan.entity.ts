import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { RiskProfile } from '@steward/shared';
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { TaxCalculation } from './tax-calculation.entity';

@Entity('financial_plans')
export class FinancialPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ type: 'enum', enum: RiskProfile, nullable: true })
  risk_profile: RiskProfile;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  risk_score: number;

  @Column({ type: 'jsonb', nullable: true })
  behaviour_profile: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estate_value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  liquidity_needs: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthly_income: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthly_expenses: number;

  @Column({ type: 'jsonb', nullable: true })
  risk_answers: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  behaviour_answers: Record<string, unknown>[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => TaxCalculation, (tc) => tc.financial_plan)
  tax_calculation: TaxCalculation;
}
