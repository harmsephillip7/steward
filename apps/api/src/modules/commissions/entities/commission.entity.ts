import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column('uuid', { nullable: true })
  client_id: string;

  @Column({ length: 50 })
  commission_type: string; // CommissionType enum: initial, ongoing, renewal, performance

  @Column({ length: 50, default: 'pending' })
  status: string; // CommissionStatus enum: pending, received, reconciled, disputed

  @Column({ length: 255 })
  product_name: string;

  @Column({ length: 100, nullable: true })
  provider: string;

  @Column({ length: 100, nullable: true })
  policy_number: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  vat_amount: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  net_amount: number;

  @Column('date')
  effective_date: Date;

  @Column('date', { nullable: true })
  received_date: Date;

  @Column('date', { nullable: true })
  reconciled_date: Date;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => Client, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column({ length: 50 })
  provider: string; // IntegrationProvider enum

  @Column({ length: 50, default: 'inactive' })
  status: string; // 'active', 'inactive', 'error'

  @Column({ length: 50, default: 'daily' })
  sync_frequency: string; // SyncFrequency

  @Column({ length: 50, default: 'never' })
  last_sync_status: string; // SyncStatus

  @Column({ type: 'timestamp', nullable: true })
  last_sync_at: Date;

  @Column('jsonb', { nullable: true })
  config: Record<string, any>;

  @Column('text', { nullable: true })
  api_key_encrypted: string;

  @Column('text', { nullable: true })
  last_error: string;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
