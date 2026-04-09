import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Fund } from './fund.entity';
import { CompromiseFlag } from './compromise-flag.entity';

@Entity('holdings')
export class Holding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fund_id: string;

  @ManyToOne(() => Fund, (fund) => fund.holdings)
  @JoinColumn({ name: 'fund_id' })
  fund: Fund;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  isin: string;

  @Column({ type: 'decimal', precision: 7, scale: 4 })
  weight_pct: number;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  country: string;

  // true if this holding is itself a fund (for look-through logic)
  @Column({ default: false })
  is_fund: boolean;

  @OneToMany(() => CompromiseFlag, (f) => f.holding)
  compromise_flags: CompromiseFlag[];
}
