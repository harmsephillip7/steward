import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProposalStatus } from '@steward/shared';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { Client } from '../../clients/entities/client.entity';
import { Lead } from './crm.entities';
import { ProposalTemplate } from './proposal-template.entity';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ nullable: true })
  lead_id: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ nullable: true })
  client_id: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ nullable: true })
  template_id: string;

  @ManyToOne(() => ProposalTemplate, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: ProposalTemplate;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ProposalStatus, default: ProposalStatus.DRAFT })
  status: ProposalStatus;

  @Column({ type: 'jsonb', default: [] })
  products: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  cover_letter: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_monthly_premium: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_lump_sum: number;

  @Column({ type: 'date', nullable: true })
  valid_until: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  pdf_url: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  viewed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  signed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
