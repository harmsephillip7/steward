import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssetClass, Region } from '@steward/shared';
import { Holding } from './holding.entity';
import { PortfolioFund } from '../../portfolios/entities/portfolio-fund.entity';

@Entity('funds')
export class Fund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  isin: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ type: 'enum', enum: AssetClass, nullable: true })
  asset_class: AssetClass;

  @Column({ type: 'enum', enum: Region, default: Region.SA })
  region: Region;

  @Column({ nullable: true })
  benchmark: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ter: number;

  @Column({ type: 'date', nullable: true })
  inception_date: Date;

  @Column({ nullable: true })
  fact_sheet_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Holding, (h) => h.fund)
  holdings: Holding[];

  @OneToMany(() => PortfolioFund, (pf) => pf.fund)
  portfolio_funds: PortfolioFund[];
}
