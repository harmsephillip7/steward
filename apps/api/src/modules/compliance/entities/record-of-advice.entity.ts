import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('records_of_advice')
export class RecordOfAdvice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (c) => c.records_of_advice)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ type: 'date' })
  advice_date: Date;

  @Column({ type: 'text' })
  advice_summary: string;

  @Column({ nullable: true })
  pdf_url: string;

  @Column({ type: 'timestamp', nullable: true })
  signed_at: Date;

  @Column({ type: 'text', nullable: true })
  client_signature: string;

  @CreateDateColumn()
  created_at: Date;
}
