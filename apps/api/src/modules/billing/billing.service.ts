import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  Plan,
  Subscription,
  Invoice,
  UsageMeter,
  PlanCode,
  SubscriptionStatus,
} from './entities/billing.entity';
import { PLAN_CATALOGUE, TRIAL_DAYS } from './plan-catalogue';

@Injectable()
export class BillingService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private readonly subRepo: Repository<Subscription>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(UsageMeter) private readonly meterRepo: Repository<UsageMeter>,
  ) {}

  /** Seed the plan catalogue on boot. Idempotent. */
  async onModuleInit() {
    for (const seed of PLAN_CATALOGUE) {
      const existing = await this.planRepo.findOne({ where: { code: seed.code } });
      if (existing) {
        Object.assign(existing, seed);
        await this.planRepo.save(existing);
      } else {
        await this.planRepo.save(this.planRepo.create(seed));
      }
    }
  }

  // ── Plans ────────────────────────────────────────────────────

  listPlans(): Promise<Plan[]> {
    return this.planRepo.find({ where: { is_active: true }, order: { price_per_seat_cents: 'ASC' } });
  }

  async getPlan(code: PlanCode): Promise<Plan> {
    const p = await this.planRepo.findOne({ where: { code } });
    if (!p) throw new NotFoundException(`Plan ${code} not found`);
    return p;
  }

  // ── Subscriptions ────────────────────────────────────────────

  /** Start a 14-day trial. Used right after signup. */
  async startTrial(args: { firmId?: string; soloAdvisorId?: string; planCode: PlanCode; seats?: number }): Promise<Subscription> {
    if (!args.firmId && !args.soloAdvisorId) {
      throw new BadRequestException('Either firmId or soloAdvisorId is required');
    }
    const plan = await this.getPlan(args.planCode);
    const seats = Math.max(args.seats ?? 1, plan.min_seats);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const sub = this.subRepo.create({
      firm_id: args.firmId ?? null,
      solo_advisor_id: args.soloAdvisorId ?? null,
      plan_id: plan.id,
      status: 'trialing',
      seats,
      current_period_start: now,
      current_period_end: trialEnd,
      trial_ends_at: trialEnd,
    });
    return this.subRepo.save(sub);
  }

  async getSubscription(args: { firmId?: string | null; soloAdvisorId?: string }): Promise<Subscription | null> {
    if (args.firmId) {
      return this.subRepo.findOne({ where: { firm_id: args.firmId }, relations: ['plan'] });
    }
    if (args.soloAdvisorId) {
      return this.subRepo.findOne({
        where: { solo_advisor_id: args.soloAdvisorId, firm_id: IsNull() },
        relations: ['plan'],
      });
    }
    return null;
  }

  async updateSeats(subscriptionId: string, seats: number): Promise<Subscription> {
    const sub = await this.subRepo.findOne({ where: { id: subscriptionId }, relations: ['plan'] });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (seats < sub.plan.min_seats) {
      throw new BadRequestException(
        `Plan ${sub.plan.code} requires a minimum of ${sub.plan.min_seats} seats`,
      );
    }
    sub.seats = seats;
    return this.subRepo.save(sub);
  }

  async cancel(subscriptionId: string): Promise<Subscription> {
    const sub = await this.subRepo.findOne({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    sub.status = 'cancelled';
    sub.cancelled_at = new Date();
    return this.subRepo.save(sub);
  }

  /** Webhook-driven status update (called from Stripe / Peach handlers). */
  async syncFromProvider(args: {
    providerSubscriptionId: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date;
  }): Promise<Subscription | null> {
    const sub = await this.subRepo.findOne({
      where: { provider_subscription_id: args.providerSubscriptionId },
    });
    if (!sub) return null;
    sub.status = args.status;
    if (args.currentPeriodEnd) sub.current_period_end = args.currentPeriodEnd;
    if (args.status === 'past_due' && !sub.past_due_since) sub.past_due_since = new Date();
    if (args.status === 'active') sub.past_due_since = null;
    return this.subRepo.save(sub);
  }

  // ── Authorisation gate ───────────────────────────────────────

  /** Returns true if the subscription permits read+write API calls. */
  canUse(sub: Subscription | null): { allowed: boolean; reason?: string; readOnly?: boolean } {
    if (!sub) return { allowed: false, reason: 'no_subscription' };
    if (sub.status === 'cancelled' || sub.status === 'expired') {
      return { allowed: false, reason: 'subscription_inactive' };
    }
    if (sub.status === 'past_due') {
      const daysPastDue = sub.past_due_since
        ? (Date.now() - sub.past_due_since.getTime()) / (1000 * 60 * 60 * 24)
        : 0;
      if (daysPastDue > 7) {
        return { allowed: true, readOnly: true, reason: 'past_due_grace_expired' };
      }
    }
    return { allowed: true };
  }

  // ── Seat enforcement ─────────────────────────────────────────

  async assertSeatAvailable(subscriptionId: string, currentMembers: number): Promise<void> {
    const sub = await this.subRepo.findOne({ where: { id: subscriptionId }, relations: ['plan'] });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (currentMembers >= sub.seats) {
      throw new ForbiddenException(
        `Seat limit reached (${sub.seats}). Upgrade your plan in Settings → Billing.`,
      );
    }
  }

  // ── Usage metering ───────────────────────────────────────────

  /** Increment the monthly usage counter; auto-creates the period bucket. */
  async incrementUsage(args: {
    firmId?: string | null;
    soloAdvisorId?: string | null;
    field: 'ai_screens' | 'esign_documents' | 'reports_generated' | 'storage_mb';
    by?: number;
  }): Promise<UsageMeter> {
    const by = args.by ?? 1;
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const where = args.firmId
      ? { firm_id: args.firmId, period_start: periodStart }
      : { solo_advisor_id: args.soloAdvisorId!, period_start: periodStart };

    let meter = await this.meterRepo.findOne({ where: where as any });
    if (!meter) {
      meter = this.meterRepo.create({
        firm_id: args.firmId ?? null,
        solo_advisor_id: args.soloAdvisorId ?? null,
        period_start: periodStart,
        period_end: periodEnd,
      });
    }
    (meter as any)[args.field] = ((meter as any)[args.field] ?? 0) + by;
    return this.meterRepo.save(meter);
  }

  async getCurrentUsage(args: { firmId?: string | null; soloAdvisorId?: string | null }): Promise<UsageMeter | null> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const where = args.firmId
      ? { firm_id: args.firmId, period_start: periodStart }
      : { solo_advisor_id: args.soloAdvisorId!, period_start: periodStart };
    return this.meterRepo.findOne({ where: where as any });
  }
}
