import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ScreeningResult } from '../../screening/entities/screening-result.entity';
import { Fund } from '../../funds/entities/fund.entity';

@Entity('replacement_suggestions')
export class ReplacementSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  screening_result_id: string;

  @ManyToOne(() => ScreeningResult, (sr) => sr.replacement_suggestions)
  @JoinColumn({ name: 'screening_result_id' })
  screening_result: ScreeningResult;

  @Column()
  original_fund_id: string;

  @ManyToOne(() => Fund)
  @JoinColumn({ name: 'original_fund_id' })
  original_fund: Fund;

  @Column()
  suggested_fund_id: string;

  @ManyToOne(() => Fund)
  @JoinColumn({ name: 'suggested_fund_id' })
  suggested_fund: Fund;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  similarity_score: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  exposure_reduction_pct: number;

  @CreateDateColumn()
  created_at: Date;
}
