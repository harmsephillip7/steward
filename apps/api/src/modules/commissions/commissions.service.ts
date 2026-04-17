import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Commission, Integration } from './entities/commission.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(Commission) private commRepo: Repository<Commission>,
    @InjectRepository(Integration) private intRepo: Repository<Integration>,
    private audit: AuditService,
  ) {}

  // ── Commissions ──────────────────────────────────────────────

  async createCommission(advisorId: string, dto: any) {
    const vatRate = 0.15;
    const amount = Number(dto.amount);
    const vat = +(amount * vatRate).toFixed(2);
    const comm = this.commRepo.create({ ...dto, advisor_id: advisorId, vat_amount: dto.vat_amount ?? vat, net_amount: dto.net_amount ?? +(amount - vat).toFixed(2) });
    return this.commRepo.save(comm);
  }

  async getCommissions(advisorId: string, status?: string) {
    const where: any = { advisor_id: advisorId };
    if (status) where.status = status;
    return this.commRepo.find({ where, order: { effective_date: 'DESC' }, relations: ['client'] });
  }

  async updateCommission(id: string, advisorId: string, dto: any) {
    const comm = await this.commRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!comm) throw new NotFoundException('Commission not found');
    if (dto.status === 'received' && !comm.received_date) comm.received_date = new Date();
    if (dto.status === 'reconciled' && !comm.reconciled_date) comm.reconciled_date = new Date();
    Object.assign(comm, dto);
    return this.commRepo.save(comm);
  }

  async getCommissionSummary(advisorId: string, year?: number) {
    const y = year || new Date().getFullYear();
    const start = new Date(`${y}-01-01`);
    const end = new Date(`${y}-12-31`);
    const comms = await this.commRepo.find({ where: { advisor_id: advisorId, effective_date: Between(start, end) as any } });

    const byType = comms.reduce((acc, c) => { acc[c.commission_type] = (acc[c.commission_type] || 0) + Number(c.amount); return acc; }, {} as Record<string, number>);
    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const monthComms = comms.filter(c => new Date(c.effective_date).getMonth() === i);
      return { month: i + 1, total: monthComms.reduce((s, c) => s + Number(c.amount), 0), count: monthComms.length };
    });
    const total = comms.reduce((s, c) => s + Number(c.amount), 0);
    const totalVat = comms.reduce((s, c) => s + Number(c.vat_amount || 0), 0);
    const totalNet = comms.reduce((s, c) => s + Number(c.net_amount || 0), 0);
    const pending = comms.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.amount), 0);

    return { year: y, total, totalVat, totalNet, pending, byType, byMonth, count: comms.length };
  }

  // ── Integrations ─────────────────────────────────────────────

  async getIntegrations(advisorId: string) {
    return this.intRepo.find({ where: { advisor_id: advisorId } });
  }

  async createIntegration(advisorId: string, dto: any) {
    const int = this.intRepo.create({ ...dto, advisor_id: advisorId });
    return this.intRepo.save(int);
  }

  async updateIntegration(id: string, advisorId: string, dto: any) {
    const int = await this.intRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!int) throw new NotFoundException('Integration not found');
    Object.assign(int, dto);
    return this.intRepo.save(int);
  }

  async deleteIntegration(id: string, advisorId: string) {
    const int = await this.intRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!int) throw new NotFoundException('Integration not found');
    await this.intRepo.remove(int);
    return { deleted: true };
  }
}
