import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CpdRecord } from '../entities/cpd-record.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class CpdService {
  constructor(
    @InjectRepository(CpdRecord)
    private readonly repo: Repository<CpdRecord>,
    private readonly audit: AuditService,
  ) {}

  async list(advisorId: string, from?: Date, to?: Date) {
    const where: any = { advisor_id: advisorId };
    if (from && to) where.completed_at = Between(from, to);
    return this.repo.find({ where, order: { completed_at: 'DESC' } });
  }

  async log(advisorId: string, payload: Partial<CpdRecord>) {
    const row = this.repo.create({ ...payload, advisor_id: advisorId });
    const saved = await this.repo.save(row);
    await this.audit.record({
      advisorId,
      actorType: 'advisor',
      action: 'cpd.log',
      entityType: 'cpd_record',
      entityId: saved.id,
      after: saved as any,
    });
    return saved;
  }

  async update(id: string, advisorId: string, payload: Partial<CpdRecord>) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('CPD record not found');
    const before = { ...existing };
    Object.assign(existing, payload);
    const saved = await this.repo.save(existing);
    await this.audit.record({
      advisorId,
      actorType: 'advisor',
      action: 'cpd.update',
      entityType: 'cpd_record',
      entityId: saved.id,
      before: before as any,
      after: saved as any,
    });
    return saved;
  }

  async delete(id: string, advisorId: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('CPD record not found');
    await this.repo.delete(id);
    await this.audit.record({
      advisorId,
      actorType: 'advisor',
      action: 'cpd.delete',
      entityType: 'cpd_record',
      entityId: id,
      before: existing as any,
    });
    return { deleted: true };
  }

  /** Sum verifiable + non-verifiable CPD hours within a period. */
  async summary(advisorId: string, from: Date, to: Date) {
    const records = await this.repo.find({
      where: { advisor_id: advisorId, completed_at: Between(from, to) },
    });
    const verifiable = records
      .filter((r) => r.verifiable)
      .reduce((s, r) => s + Number(r.hours || 0), 0);
    const non_verifiable = records
      .filter((r) => !r.verifiable)
      .reduce((s, r) => s + Number(r.hours || 0), 0);
    const total = verifiable + non_verifiable;
    // FSCA CPD: 18 hours per cycle (varies by class of advice)
    const required = 18;
    return {
      from,
      to,
      verifiable,
      non_verifiable,
      total,
      required,
      remaining: Math.max(0, required - total),
      compliant: total >= required,
      records,
    };
  }
}
