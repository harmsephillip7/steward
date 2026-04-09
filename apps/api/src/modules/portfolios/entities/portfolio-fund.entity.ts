import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Fund } from '../../funds/entities/fund.entity';

@Entity('portfolio_funds')
export class PortfolioFund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  portfolio_id: string;

  @ManyToOne(() => Portfolio, (p) => p.portfolio_funds)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  fund_id: string;

  @ManyToOne(() => Fund, (f) => f.portfolio_funds)
  @JoinColumn({ name: 'fund_id' })
  fund: Fund;

  @Column({ type: 'decimal', precision: 7, scale: 4 })
  allocation_pct: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, nullable: true })
  units: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number;
}
