import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { PlanCode, SubscriptionStatus } from './entities/billing.entity';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  /** Public — used by the marketing /pricing page. */
  @Get('plans')
  @ApiOperation({ summary: 'List active subscription plans' })
  listPlans() {
    return this.billing.listPlans();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('subscription')
  @ApiOperation({ summary: 'Get the current tenant subscription' })
  async mySubscription(@Req() req: any) {
    const sub = await this.billing.getSubscription({
      firmId: req.tenant?.firmId ?? null,
      soloAdvisorId: req.tenant?.firmId ? undefined : req.user.id,
    });
    if (!sub) return null;
    const usage = await this.billing.getCurrentUsage({
      firmId: req.tenant?.firmId ?? null,
      soloAdvisorId: req.tenant?.firmId ? undefined : req.user.id,
    });
    return { subscription: sub, usage };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('subscription/seats')
  @ApiOperation({ summary: 'Update subscription seat count' })
  async updateSeats(@Req() req: any, @Body() body: { seats: number }) {
    const sub = await this.billing.getSubscription({
      firmId: req.tenant?.firmId ?? null,
      soloAdvisorId: req.tenant?.firmId ? undefined : req.user.id,
    });
    if (!sub) return null;
    return this.billing.updateSeats(sub.id, body.seats);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('subscription/cancel')
  @ApiOperation({ summary: 'Cancel current subscription' })
  async cancel(@Req() req: any) {
    const sub = await this.billing.getSubscription({
      firmId: req.tenant?.firmId ?? null,
      soloAdvisorId: req.tenant?.firmId ? undefined : req.user.id,
    });
    if (!sub) return null;
    return this.billing.cancel(sub.id);
  }

  /**
   * Stripe webhook receiver. Signature verification is left to a follow-up
   * once STRIPE_WEBHOOK_SECRET is provisioned in Railway. Until then this
   * endpoint is dev-only and accepts a normalised payload from Stripe CLI.
   */
  @Post('webhooks/stripe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook (subscription.updated, invoice.paid)' })
  async stripeWebhook(
    @Headers('stripe-signature') _sig: string,
    @Body() event: { type: string; data: { object: any } },
  ) {
    const obj = event?.data?.object;
    if (!obj) return { received: true };
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const status = mapStripeStatus(obj.status);
      await this.billing.syncFromProvider({
        providerSubscriptionId: obj.id,
        status,
        currentPeriodEnd: obj.current_period_end ? new Date(obj.current_period_end * 1000) : undefined,
      });
    }
    return { received: true };
  }

  /** Internal helper for signup flow; exposed for the auth controller. */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('subscription/start-trial')
  @ApiOperation({ summary: 'Start a 14-day trial for the chosen plan' })
  async startTrial(@Req() req: any, @Body() body: { plan_code: PlanCode; seats?: number }) {
    return this.billing.startTrial({
      firmId: req.tenant?.firmId ?? undefined,
      soloAdvisorId: req.tenant?.firmId ? undefined : req.user.id,
      planCode: body.plan_code,
      seats: body.seats,
    });
  }
}

function mapStripeStatus(s: string): SubscriptionStatus {
  switch (s) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
      return 'cancelled';
    case 'paused':
      return 'paused';
    default:
      return 'expired';
  }
}
