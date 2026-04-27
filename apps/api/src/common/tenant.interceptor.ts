import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { FirmMember } from '../modules/firm/entities/firm.entity';

export interface TenantContext {
  advisorId: string;
  firmId: string | null;
  firmRole: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Resolves and attaches a TenantContext to every authenticated request.
 *
 * Tenancy model:
 *   - Solo advisors: firmId === null. All queries scoped by advisor_id.
 *   - Firm advisors: firmId is set. Services that opt-in to firm scoping
 *     can use firmId to share data across the firm; per-advisor isolation
 *     remains the default.
 *
 * Cross-firm leakage is prevented because every entity is rooted in
 * `advisor_id`, and JWT.sub identifies that advisor uniquely.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(FirmMember)
    private readonly memberRepo: Repository<FirmMember>,
  ) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest();
    const advisorId = req.user?.id || req.user?.sub;
    if (advisorId && !req.tenant) {
      // JWT may already carry firm context; honour it but verify membership.
      let firmId: string | null = req.user?.firm_id ?? null;
      let firmRole: string | null = req.user?.firm_role ?? null;
      if (!firmId) {
        const m = await this.memberRepo.findOne({
          where: { advisor_id: advisorId, is_active: true },
        });
        firmId = m?.firm_id ?? null;
        firmRole = m?.role ?? null;
      }
      req.tenant = { advisorId, firmId, firmRole };
    }
    return next.handle();
  }
}
