import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

export enum AccountType {
  CHEQUE = 'cheque',
  CREDIT = 'credit',
  SAVINGS = 'savings',
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
}

@Entity('budget_statements')
export class BudgetStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  filename: string;

  /** e.g. "2025-01" — the month this statement covers */
  @Column()
  statement_month: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.CHEQUE })
  account_type: AccountType;

  @Column({ type: 'jsonb', default: [] })
  transactions: Transaction[];

  @CreateDateColumn()
  created_at: Date;
}
