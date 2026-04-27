import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from './billing.service';

/**
 * Gates protected routes behind an active subscription.
 *
 *   - trialing / active            → full access
 *   - past_due (≤7 days)           → full access (in-app nag)
 *   - past_due (>7 days)           → reads only; throws on writes
 *   - cancelled / expired / none   → 402 PaymentRequired
 *
 * Use `@Public()` (existing decorator) to skip on public endpoints.
 * Use `@AllowReadOnly()` decorator to permit reads even when grace expires.
 */
export const ALLOW_READ_ONLY_KEY = 'billing.allow_read_only';
export const AllowReadOnly = () => Reflect.metadata(ALLOW_READ_ONLY_KEY, true);

@Injectable()
export class BillingGuard implements CanActivate {
  constructor(
    private readonly billing: BillingService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return true; // unauthenticated routes are out of scope

    const tenant = req.tenant;
    const sub = await this.billing.getSubscription({
      firmId: tenant?.firmId ?? null,
      soloAdvisorId: tenant?.firmId ? undefined : user.id,
    });

    const verdict = this.billing.canUse(sub);
    const isWrite = req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS';

    if (!verdict.allowed) {
      throw new HttpException(
        { error: 'subscription_required', reason: verdict.reason },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    if (verdict.readOnly && isWrite) {
      const allowReadOnly = this.reflector.get<boolean>(ALLOW_READ_ONLY_KEY, ctx.getHandler());
      if (!allowReadOnly) {
        throw new ForbiddenException({
          error: 'read_only_mode',
          reason: 'subscription_past_due_grace_expired',
        });
      }
    }
    return true;
  }
}
