import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FitAndProperRecord } from '../entities/fit-and-proper.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class FitAndProperService {
  constructor(
    @InjectRepository(FitAndProperRecord)
    private readonly repo: Repository<FitAndProperRecord>,
    private readonly audit: AuditService,
  ) {}

  async list(advisorId: string) {
    return this.repo.find({ where: { advisor_id: advisorId }, order: { period_end: 'DESC' } });
  }

  async getCurrent(advisorId: string) {
    const today = new Date();
    return this.repo.findOne({
      where: { advisor_id: advisorId },
      order: { period_end: 'DESC' },
    }) ?? null;
  }

  async create(advisorId: string, payload: Partial<FitAndProperRecord>, actorId: string) {
    const row = this.repo.create({ ...payload, advisor_id: advisorId });
    const saved = await this.repo.save(row);
    await this.audit.record({
      advisorId,
      actorType: 'advisor',
      action: 'fit_and_proper.create',
      entityType: 'fit_and_proper_record',
      entityId: saved.id,
      after: saved as any,
    });
    return saved;
  }

  async update(id: string, advisorId: string, payload: Partial<FitAndProperRecord>) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');
    const before = { ...existing };
    Object.assign(existing, payload);
    const saved = await this.repo.save(existing);
    await this.audit.record({
      advisorId,
      actorType: 'advisor',
      action: 'fit_and_proper.update',
      entityType: 'fit_and_proper_record',
      entityId: saved.id,
      before: before as any,
      after: saved as any,
    });
    return saved;
  }

  async attest(id: string, advisorId: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');
    if (
      !existing.honesty_integrity_declared ||
      !existing.solvency_declared ||
      !existing.personal_character_declared ||
      !existing.pi_cover_in_force ||
      !existing.operational_ability_confirmed
    ) {
      throw new NotFoundException(
        'All five fit & proper declarations must be true before attestation',
      );
    }
    existing.attested = true;
    existing.attested_at = new Date();
    const saved = await this.repo.save(existing);
    await this.audit.record({
      advisorId,
      actorType: 'advisor',
      action: 'fit_and_proper.attest',
      entityType: 'fit_and_proper_record',
      entityId: saved.id,
      after: { attested: true, attested_at: saved.attested_at } as any,
    });
    return saved;
  }
}
