import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GoalCategory, GoalPriority, GoalStatus } from '@steward/shared';
import { Client } from './client.entity';

@Entity('financial_goals')
export class FinancialGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.financial_goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: GoalCategory })
  category: GoalCategory;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  target_amount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  current_amount: number;

  @Column({ type: 'date', nullable: true })
  target_date: Date;

  @Column({ type: 'enum', enum: GoalPriority, default: GoalPriority.IMPORTANT })
  priority: GoalPriority;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthly_contribution: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.ACTIVE })
  status: GoalStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
