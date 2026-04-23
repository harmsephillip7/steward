import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('client_onboarding_tokens')
export class ClientOnboardingToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  advisor_id: string;

  @Column('uuid')
  client_id: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  /** UUID token used as the public URL secret */
  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  token: string;

  /** Ordered list of step keys the client must complete */
  @Column('jsonb')
  steps: string[];

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date;

  /** Which steps have been individually completed */
  @Column('jsonb', { default: [] })
  completed_steps: string[];

  @CreateDateColumn()
  created_at: Date;
}
