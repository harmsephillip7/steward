import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('advisory_recommendations')
export class AdvisoryRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column('uuid')
  client_id: string;

  @Column({ length: 50 })
  category: string; // AdvisoryCategory enum

  @Column({ length: 50, default: 'medium' })
  priority: string; // AdvisoryPriority enum

  @Column({ length: 50, default: 'pending' })
  status: string; // AdvisoryStatus enum

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  rationale: string;

  @Column('jsonb', { nullable: true })
  action_items: { step: string; completed: boolean }[];

  @Column('jsonb', { nullable: true })
  ai_context: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  implemented_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  dismissed_at: Date;

  @Column({ length: 500, nullable: true })
  dismiss_reason: string;

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
