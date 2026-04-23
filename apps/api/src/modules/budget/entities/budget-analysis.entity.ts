import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

export interface BlueprintCategory {
  actual_amount: number;
  actual_pct: number;
  target_pct: number;
  variance_pct: number;
  status: 'on_track' | 'over' | 'under';
}

@Entity('budget_analyses')
export class BudgetAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  client_id: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  /** category → monthly average spend in ZAR */
  @Column({ type: 'jsonb', default: {} })
  monthly_averages: Record<string, number>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_income_avg: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_expenses_avg: number;

  /** category → BlueprintCategory comparison object */
  @Column({ type: 'jsonb', default: {} })
  blueprint_comparison: Record<string, BlueprintCategory>;

  /** Wellness score 0–100 */
  @Column({ type: 'int', default: 0 })
  score: number;

  /** e.g. "Excellent", "Good", "Fair", "Needs Work" */
  @Column({ nullable: true })
  score_label: string;

  /** Things the client is doing well */
  @Column({ type: 'jsonb', default: [] })
  strengths: string[];

  /** Categories where client is overspending */
  @Column({ type: 'jsonb', default: [] })
  overspending_areas: string[];

  /** AI-generated stewardship advice paragraph */
  @Column({ type: 'text', nullable: true })
  ai_advice: string;

  /** Consecutive months analysed (streak tracking) */
  @Column({ type: 'int', default: 0 })
  streak_months: number;

  /** How many statement months were included */
  @Column({ type: 'int', default: 0 })
  statements_analysed: number;

  /** Whether the advisor can see this analysis */
  @Column({ default: true })
  is_shared_with_advisor: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
