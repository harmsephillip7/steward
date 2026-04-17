import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IncomeExpenseType, Frequency } from '@steward/shared';
import { Client } from './client.entity';

@Entity('income_expenses')
export class IncomeExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.income_expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: IncomeExpenseType })
  type: IncomeExpenseType;

  @Column()
  category: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: Frequency, default: Frequency.MONTHLY })
  frequency: Frequency;

  @Column({ default: true })
  is_recurring: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
