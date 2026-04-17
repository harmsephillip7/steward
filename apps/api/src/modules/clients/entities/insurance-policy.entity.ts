import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InsurancePolicyType, InsurancePolicyStatus } from '@steward/shared';
import { Client } from './client.entity';

@Entity('insurance_policies')
export class InsurancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.insurance_policies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: InsurancePolicyType })
  type: InsurancePolicyType;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  policy_number: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  cover_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthly_premium: number;

  @Column({ type: 'date', nullable: true })
  inception_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'jsonb', nullable: true })
  beneficiaries: Record<string, any>[];

  @Column({ type: 'enum', enum: InsurancePolicyStatus, default: InsurancePolicyStatus.ACTIVE })
  status: InsurancePolicyStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
