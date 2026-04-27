import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Complaint, ComplaintStatus } from '../entities/complaint.entity';
import { AuditService } from '../../audit/audit.service';

const SIX_WEEKS_MS = 6 * 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly repo: Repository<Complaint>,
    private readonly audit: AuditService,
  ) {}

  async list(advisorId: string) {
    const rows = await this.repo.find({
      where: { advisor_id: advisorId },
      order: { received_at: 'DESC' },
    });
    // Mark ombud_eligible on read to keep list current
    const now = Date.now();
    for (const c of rows) {
      if (
        !c.resolved_at &&
        c.status !== 'resolved' &&
        c.status !== 'rejected' &&
        now - new Date(c.received_at).getTime() > SIX_WEEKS_MS &&
        !c.ombud_eligible
      ) {
        c.ombud_eligible = true;
        await this.repo.save(c);
      }
    }
    return rows;
  }

  async create(advisorId: string, payload: Partial<Complaint>) {
    const row = this.repo.create({
      ...payload,
      advisor_id: advisorId,
      received_at: payload.received_at ?? new Date(),
      status: payload.status ?? 'received',
    });
    const saved = await this.repo.save(row);
    await this.audit.record({
      advisorId,
      clientId: saved.client_id ?? undefined,
      actorType: 'advisor',
      action: 'complaint.create',
      entityType: 'complaint',
      entityId: saved.id,
      after: saved as any,
    });
    return saved;
  }

  async updateStatus(
    id: string,
    advisorId: string,
    status: ComplaintStatus,
    extras: Partial<Complaint> = {},
  ) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');
    const before = { ...existing };
    existing.status = status;
    if (status === 'acknowledged' && !existing.acknowledged_at) {
      existing.acknowledged_at = new Date();
    }
    if ((status === 'resolved' || status === 'rejected') && !existing.resolved_at) {
      existing.resolved_at = new Date();
    }
    Object.assign(existing, extras);
    const saved = await this.repo.save(existing);
    await this.audit.record({
      advisorId,
      clientId: saved.client_id ?? undefined,
      actorType: 'advisor',
      action: `complaint.status.${status}`,
      entityType: 'complaint',
      entityId: saved.id,
      before: before as any,
      after: saved as any,
    });
    return saved;
  }

  /** Returns complaints unresolved for >6 weeks (FAIS Ombud jurisdiction). */
  async ombudEligible(advisorId: string) {
    const cutoff = new Date(Date.now() - SIX_WEEKS_MS);
    return this.repo
      .createQueryBuilder('c')
      .where('c.advisor_id = :advisorId', { advisorId })
      .andWhere('c.received_at < :cutoff', { cutoff })
      .andWhere('c.resolved_at IS NULL')
      .andWhere('c.status NOT IN (:...closed)', { closed: ['resolved', 'rejected'] })
      .orderBy('c.received_at', 'ASC')
      .getMany();
  }
}
