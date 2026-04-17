import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('compliance_reviews')
export class ComplianceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column('uuid')
  client_id: string;

  @Column({ length: 50 })
  review_type: string; // ReviewType enum

  @Column('date')
  review_date: Date;

  @Column('date', { nullable: true })
  next_review_date: Date;

  @Column({ length: 50, default: 'scheduled' })
  status: string; // 'scheduled', 'in_progress', 'completed', 'overdue'

  @Column('text', { nullable: true })
  findings: string;

  @Column('text', { nullable: true })
  recommendations: string;

  @Column('jsonb', { nullable: true })
  checklist: { item: string; passed: boolean; notes?: string }[];

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
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

@Entity('conflicts_of_interest')
export class ConflictOfInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column('uuid', { nullable: true })
  client_id: string;

  @Column({ length: 50 })
  conflict_type: string; // ConflictType enum

  @Column({ length: 255 })
  description: string;

  @Column('text', { nullable: true })
  mitigation: string;

  @Column({ length: 50, default: 'identified' })
  status: string; // 'identified', 'disclosed', 'mitigated', 'resolved'

  @Column('date', { nullable: true })
  disclosed_date: Date;

  @Column('date', { nullable: true })
  resolved_date: Date;

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

@Entity('regulatory_returns')
export class RegulatoryReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column({ length: 50 })
  return_type: string; // RegulatoryReturnType enum

  @Column({ length: 50, default: 'not_started' })
  status: string; // RegulatoryReturnStatus enum

  @Column('date')
  due_date: Date;

  @Column('date', { nullable: true })
  period_start: Date;

  @Column('date', { nullable: true })
  period_end: Date;

  @Column('date', { nullable: true })
  submitted_date: Date;

  @Column({ length: 100, nullable: true })
  reference_number: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('jsonb', { nullable: true })
  data: Record<string, any>;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
