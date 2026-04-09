import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompromiseCategory } from '@steward/shared';
import { ScreeningResult } from './screening-result.entity';

@Entity('category_exposures')
export class CategoryExposure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  screening_result_id: string;

  @ManyToOne(() => ScreeningResult, (sr) => sr.category_exposures)
  @JoinColumn({ name: 'screening_result_id' })
  screening_result: ScreeningResult;

  @Column({ type: 'enum', enum: CompromiseCategory })
  category: CompromiseCategory;

  @Column({ type: 'decimal', precision: 7, scale: 4 })
  exposure_pct: number;

  @Column({ default: 0 })
  affected_funds_count: number;

  @Column({ type: 'jsonb', nullable: true })
  affected_funds: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  flagged_companies: Record<string, unknown>[];
}
