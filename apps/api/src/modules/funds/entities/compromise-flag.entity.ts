import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CompromiseCategory, FlagSource } from '@steward/shared';
import { Holding } from './holding.entity';

@Entity('compromise_flags')
export class CompromiseFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  holding_id: string;

  @ManyToOne(() => Holding, (h) => h.compromise_flags)
  @JoinColumn({ name: 'holding_id' })
  holding: Holding;

  @Column({ type: 'enum', enum: CompromiseCategory })
  category: CompromiseCategory;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  confidence_score: number;

  @Column({ type: 'enum', enum: FlagSource, default: FlagSource.MANUAL })
  flagged_by: FlagSource;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
