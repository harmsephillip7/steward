import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Firm } from '../../firm/entities/firm.entity';
import { Advisor } from '../../advisors/entities/advisor.entity';

export type PlanCode = 'solo' | 'firm' | 'enterprise';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'paused'
  | 'expired';

/**
 * Plan catalogue. Codes are stable; prices may change.
 * Currency is ZAR cents (avoid floats).
 */
@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 32 })
  code: PlanCode;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  /** Per-seat price in ZAR cents per month. */
  @Column('integer')
  price_per_seat_cents: number;

  /** Flat platform fee in ZAR cents per month (Firm/Enterprise). */
  @Column('integer', { default: 0 })
  platform_fee_cents: number;

  /** Minimum seats required (Firm = 3, Enterprise = 25). */
  @Column('integer', { default: 1 })
  min_seats: number;

  /** Maximum clients per advisor seat. NULL = unlimited. */
  @Column('integer', { nullable: true })
  client_cap_per_seat: number | null;

  /** Soft cap on AI screenings per firm per month. NULL = unlimited. */
  @Column('integer', { nullable: true })
  ai_screen_soft_cap: number | null;

  /** Soft cap on e-signature documents per firm per month. NULL = unlimited. */
  @Column('integer', { nullable: true })
  esign_soft_cap: number | null;

  /** Whether the tier offers a dedicated database (Enterprise only). */
  @Column({ default: false })
  dedicated_database: boolean;

  /** Whether the tier offers white-label / custom domain. */
  @Column({ default: false })
  white_label: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/**
 * One subscription per Firm (or per solo Advisor — uses solo_advisor_id when firm_id is null).
 * Owns billing state, seats, and trial window.
 */
@Entity('subscriptions')
@Index(['firm_id'], { unique: true, where: '"firm_id" IS NOT NULL' })
@Index(['solo_advisor_id'], { unique: true, where: '"solo_advisor_id" IS NOT NULL' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  firm_id: string | null;

  @ManyToOne(() => Firm, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'firm_id' })
  firm: Firm | null;

  @Column('uuid', { nullable: true })
  solo_advisor_id: string | null;

  @ManyToOne(() => Advisor, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'solo_advisor_id' })
  solo_advisor: Advisor | null;

  @Column('uuid')
  plan_id: string;

  @ManyToOne(() => Plan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ type: 'varchar', length: 32, default: 'trialing' })
  status: SubscriptionStatus;

  @Column('integer', { default: 1 })
  seats: number;

  @Column({ type: 'timestamptz' })
  current_period_start: Date;

  @Column({ type: 'timestamptz' })
  current_period_end: Date;

  @Column({ type: 'timestamptz', nullable: true })
  trial_ends_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  past_due_since: Date | null;

  /** External payment provider reference. */
  @Column({ type: 'varchar', length: 32, nullable: true })
  provider: 'stripe' | 'peach' | null;

  @Column({ length: 255, nullable: true })
  provider_subscription_id: string;

  @Column({ length: 255, nullable: true })
  provider_customer_id: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Invoice, (i) => i.subscription)
  invoices: Invoice[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  subscription_id: string;

  @ManyToOne(() => Subscription, (s) => s.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'varchar', length: 32 })
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

  @Column('integer')
  amount_cents: number;

  @Column({ length: 8, default: 'ZAR' })
  currency: string;

  @Column({ type: 'timestamptz' })
  period_start: Date;

  @Column({ type: 'timestamptz' })
  period_end: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date | null;

  @Column({ length: 255, nullable: true })
  provider_invoice_id: string;

  @Column({ length: 500, nullable: true })
  hosted_invoice_url: string;

  @Column('jsonb', { nullable: true })
  line_items: Array<{ description: string; quantity: number; unit_amount_cents: number }>;

  @CreateDateColumn()
  created_at: Date;
}

/**
 * Monthly usage counters per firm/advisor. Reset by a scheduled job.
 * Provides the data behind soft-cap warnings and overage billing.
 */
@Entity('usage_meters')
@Index(['firm_id', 'period_start'])
@Index(['solo_advisor_id', 'period_start'])
export class UsageMeter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  firm_id: string | null;

  @Column('uuid', { nullable: true })
  solo_advisor_id: string | null;

  @Column({ type: 'timestamptz' })
  period_start: Date;

  @Column({ type: 'timestamptz' })
  period_end: Date;

  @Column('integer', { default: 0 })
  ai_screens: number;

  @Column('integer', { default: 0 })
  esign_documents: number;

  @Column('integer', { default: 0 })
  reports_generated: number;

  @Column('integer', { default: 0 })
  storage_mb: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
