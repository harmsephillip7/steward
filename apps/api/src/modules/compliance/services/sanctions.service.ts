import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SanctionsScreen } from '../entities/sanctions-screen.entity';
import { AuditService } from '../../audit/audit.service';

/**
 * Stub sanctions/PEP screening service. The actual provider integration
 * (Refinitiv / ComplyAdvantage / LexisNexis) plugs into `runProviderScreen()`.
 * For now we record manual entries so the register exists.
 */
@Injectable()
export class SanctionsService {
  constructor(
    @InjectRepository(SanctionsScreen)
    private readonly repo: Repository<SanctionsScreen>,
    private readonly audit: AuditService,
  ) {}

  async list(advisorId: string) {
    return this.repo.find({
      where: { advisor_id: advisorId },
      order: { screened_at: 'DESC' },
    });
  }

  async record(advisorId: string, payload: Partial<SanctionsScreen>) {
    const row = this.repo.create({
      ...payload,
      advisor_id: advisorId,
      screened_at: payload.screened_at ?? new Date(),
      status: payload.status ?? 'pending',
    });
    const saved = await this.repo.save(row);
    await this.audit.record({
      advisorId,
      clientId: saved.client_id ?? undefined,
      actorType: 'advisor',
      action: 'sanctions.screen',
      entityType: 'sanctions_screen',
      entityId: saved.id,
      after: saved as any,
    });
    return saved;
  }
}
