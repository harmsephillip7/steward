import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Lead captured from /contact-sales (Enterprise enquiry form). */
@Entity('sales_leads')
export class SalesLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  contact_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255 })
  firm_name: string;

  @Column({ type: 'varchar', length: 32 })
  tier_interest: 'solo' | 'firm' | 'enterprise';

  @Column('integer', { nullable: true })
  advisor_count: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 32, default: 'new' })
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
