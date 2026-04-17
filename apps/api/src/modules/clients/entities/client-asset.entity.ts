import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClientAssetCategory } from '@steward/shared';
import { Client } from './client.entity';

@Entity('client_assets')
export class ClientAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: ClientAssetCategory })
  category: ClientAssetCategory;

  @Column()
  description: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  current_value: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  purchase_value: number;

  @Column({ type: 'date', nullable: true })
  purchase_date: Date;

  @Column({ nullable: true })
  account_number: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthly_contribution: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
