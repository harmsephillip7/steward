import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LifeEventType } from '@steward/shared';
import { Client } from './client.entity';

@Entity('life_events')
export class LifeEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.life_events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'enum', enum: LifeEventType })
  type: LifeEventType;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  financial_impact: number;

  @Column({ default: true })
  advice_trigger: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
