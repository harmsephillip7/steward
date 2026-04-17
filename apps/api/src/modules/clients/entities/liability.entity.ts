import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LiabilityCategory } from '@steward/shared';
import { Client } from './client.entity';

@Entity('liabilities')
export class Liability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.liabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: LiabilityCategory })
  category: LiabilityCategory;

  @Column()
  description: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  outstanding_balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthly_repayment: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interest_rate: number;

  @Column({ type: 'date', nullable: true })
  maturity_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
