import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { PortfolioFund } from './portfolio-fund.entity';
import { ScreeningResult } from '../../screening/entities/screening-result.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.portfolios)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_value: number;

  @Column({ default: 'ZAR' })
  currency: string;

  @Column({ nullable: true })
  mandate_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PortfolioFund, (pf) => pf.portfolio)
  portfolio_funds: PortfolioFund[];

  @OneToMany(() => ScreeningResult, (sr) => sr.portfolio)
  screening_results: ScreeningResult[];
}
