import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IngestionStatus } from '@steward/shared';

@Entity('ingestion_jobs')
export class IngestionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fund_id: string;

  @Column()
  filename: string;

  @Column({ type: 'enum', enum: IngestionStatus, default: IngestionStatus.PENDING })
  status: IngestionStatus;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'int', default: 0 })
  holdings_extracted: number;

  @CreateDateColumn()
  started_at: Date;

  @UpdateDateColumn()
  completed_at: Date;
}
