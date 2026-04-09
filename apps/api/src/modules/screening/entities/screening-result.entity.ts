import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ScreeningMode } from '@steward/shared';
import { Portfolio } from '../../portfolios/entities/portfolio.entity';
import { CategoryExposure } from './category-exposure.entity';
import { ReplacementSuggestion } from '../../replacement/entities/replacement-suggestion.entity';

@Entity('screening_results')
export class ScreeningResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  portfolio_id: string;

  @ManyToOne(() => Portfolio, (p) => p.screening_results)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ type: 'enum', enum: ScreeningMode, default: ScreeningMode.WEIGHTED })
  mode: ScreeningMode;

  @Column({ type: 'decimal', precision: 7, scale: 4 })
  clean_pct: number;

  @Column({ type: 'decimal', precision: 7, scale: 4 })
  compromised_pct: number;

  @Column({ default: false })
  passed_strict_mode: boolean;

  @Column({ type: 'jsonb', nullable: true })
  report_json: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => CategoryExposure, (ce) => ce.screening_result)
  category_exposures: CategoryExposure[];

  @OneToMany(() => ReplacementSuggestion, (rs) => rs.screening_result)
  replacement_suggestions: ReplacementSuggestion[];
}
