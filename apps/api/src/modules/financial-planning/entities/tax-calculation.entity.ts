import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { FinancialPlan } from './financial-plan.entity';

@Entity('tax_calculations')
export class TaxCalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  financial_plan_id: string;

  @OneToOne(() => FinancialPlan, (fp) => fp.tax_calculation)
  @JoinColumn({ name: 'financial_plan_id' })
  financial_plan: FinancialPlan;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cgt_liability: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  income_tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estate_duty: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  marginal_rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  effective_rate: number;

  @Column({ nullable: true })
  tax_year: string;

  @Column({ type: 'jsonb', nullable: true })
  cgt_breakdown: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  income_tax_breakdown: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  estate_breakdown: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;
}
