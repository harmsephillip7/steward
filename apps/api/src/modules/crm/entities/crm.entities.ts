import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { LeadSource, LeadStage, TaskPriority } from '@steward/shared';
import type { DiscoveryData, AnalysisData, StageHistoryEntry } from '@steward/shared';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'enum', enum: LeadSource, default: LeadSource.REFERRAL })
  source: LeadSource;

  @Column({ type: 'enum', enum: LeadStage, default: LeadStage.NEW })
  stage: LeadStage;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  expected_value: number;

  @Column({ type: 'date', nullable: true })
  expected_close_date: Date;

  @Column({ type: 'text', nullable: true })
  lost_reason: string;

  @Column({ nullable: true })
  converted_client_id: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'converted_client_id' })
  converted_client: Client;

  @Column({ type: 'jsonb', nullable: true })
  discovery_data: DiscoveryData;

  @Column({ type: 'jsonb', nullable: true })
  analysis_data: AnalysisData;

  @Column({ type: 'jsonb', default: [] })
  stage_history: StageHistoryEntry[];

  @OneToMany(() => Activity, (a) => a.lead)
  activities: Activity[];

  @OneToMany(() => Task, (t) => t.lead)
  tasks: Task[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ nullable: true })
  lead_id: string;

  @ManyToOne(() => Lead, (l) => l.activities, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ nullable: true })
  client_id: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  type: string;

  @Column()
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ nullable: true })
  lead_id: string;

  @ManyToOne(() => Lead, (l) => l.tasks, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ nullable: true })
  client_id: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'enum', enum: LeadStage, nullable: true })
  stage: LeadStage;

  @Column({ default: false })
  is_auto: boolean;

  @CreateDateColumn()
  created_at: Date;
}
