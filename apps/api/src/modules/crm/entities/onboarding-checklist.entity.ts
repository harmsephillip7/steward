import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OnboardingStatus } from '@steward/shared';
import { Advisor } from '../../advisors/entities/advisor.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('onboarding_checklists')
export class OnboardingChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ type: 'enum', enum: OnboardingStatus, default: OnboardingStatus.IN_PROGRESS })
  status: OnboardingStatus;

  @Column({ type: 'jsonb', default: [] })
  items: {
    key: string;
    label: string;
    required: boolean;
    completed: boolean;
    completed_at?: string;
    document_id?: string;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
