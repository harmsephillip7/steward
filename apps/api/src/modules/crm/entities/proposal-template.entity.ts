import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Advisor } from '../../advisors/entities/advisor.entity';

@Entity('proposal_templates')
export class ProposalTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  advisor_id: string;

  @ManyToOne(() => Advisor)
  @JoinColumn({ name: 'advisor_id' })
  advisor: Advisor;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'jsonb', default: [] })
  product_types: string[];

  @Column({ type: 'text', nullable: true })
  cover_letter_template: string;

  @Column({ type: 'text', nullable: true })
  disclaimer_text: string;

  @Column({ type: 'jsonb', default: [] })
  sections_enabled: string[];

  @Column({ type: 'text', nullable: true })
  default_terms: string;

  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
