import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ComplianceReview, ConflictOfInterest, RegulatoryReturn } from './entities/enhanced-compliance.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EnhancedComplianceService {
  constructor(
    @InjectRepository(ComplianceReview) private reviewRepo: Repository<ComplianceReview>,
    @InjectRepository(ConflictOfInterest) private conflictRepo: Repository<ConflictOfInterest>,
    @InjectRepository(RegulatoryReturn) private returnRepo: Repository<RegulatoryReturn>,
    private audit: AuditService,
  ) {}

  // ── Reviews ──────────────────────────────────────────────────

  async createReview(advisorId: string, dto: any) {
    const review = this.reviewRepo.create({ ...dto, advisor_id: advisorId });
    return this.reviewRepo.save(review);
  }

  async getReviews(advisorId: string, clientId?: string) {
    const where: any = { advisor_id: advisorId };
    if (clientId) where.client_id = clientId;
    return this.reviewRepo.find({ where, order: { review_date: 'DESC' }, relations: ['client'] });
  }

  async completeReview(id: string, advisorId: string, dto: { findings: string; recommendations: string; checklist: any[]; next_review_date: string }) {
    const review = await this.reviewRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!review) throw new NotFoundException('Review not found');
    Object.assign(review, dto, { status: 'completed', completed_at: new Date() });
    const saved = await this.reviewRepo.save(review);
    await this.audit.log(advisorId, 'compliance_review_completed', 'compliance_review', id, { review_type: review.review_type });
    return saved;
  }

  async getOverdueReviews(advisorId: string) {
    return this.reviewRepo.find({
      where: { advisor_id: advisorId, status: 'scheduled', next_review_date: LessThanOrEqual(new Date()) as any },
      relations: ['client'],
      order: { next_review_date: 'ASC' },
    });
  }

  // ── Conflicts ────────────────────────────────────────────────

  async createConflict(advisorId: string, dto: any) {
    const conflict = this.conflictRepo.create({ ...dto, advisor_id: advisorId });
    const saved = await this.conflictRepo.save(conflict);
    const result = Array.isArray(saved) ? saved[0] : saved;
    await this.audit.log(advisorId, 'conflict_identified', 'conflict_of_interest', result.id);
    return saved;
  }

  async getConflicts(advisorId: string) {
    return this.conflictRepo.find({ where: { advisor_id: advisorId }, order: { created_at: 'DESC' }, relations: ['client'] });
  }

  async updateConflict(id: string, advisorId: string, dto: any) {
    const conflict = await this.conflictRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!conflict) throw new NotFoundException('Conflict not found');
    Object.assign(conflict, dto);
    if (dto.status === 'disclosed' && !conflict.disclosed_date) conflict.disclosed_date = new Date();
    if (dto.status === 'resolved' && !conflict.resolved_date) conflict.resolved_date = new Date();
    return this.conflictRepo.save(conflict);
  }

  // ── Regulatory Returns ───────────────────────────────────────

  async createReturn(advisorId: string, dto: any) {
    const ret = this.returnRepo.create({ ...dto, advisor_id: advisorId });
    return this.returnRepo.save(ret);
  }

  async getReturns(advisorId: string) {
    return this.returnRepo.find({ where: { advisor_id: advisorId }, order: { due_date: 'ASC' } });
  }

  async updateReturn(id: string, advisorId: string, dto: any) {
    const ret = await this.returnRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!ret) throw new NotFoundException('Regulatory return not found');
    Object.assign(ret, dto);
    if (dto.status === 'submitted' && !ret.submitted_date) ret.submitted_date = new Date();
    return this.returnRepo.save(ret);
  }

  // ── Dashboard ────────────────────────────────────────────────

  async getComplianceDashboard(advisorId: string) {
    const reviews = await this.reviewRepo.find({ where: { advisor_id: advisorId } });
    const conflicts = await this.conflictRepo.find({ where: { advisor_id: advisorId } });
    const returns = await this.returnRepo.find({ where: { advisor_id: advisorId } });

    const now = new Date();
    const overdueReviews = reviews.filter(r => r.status === 'scheduled' && r.next_review_date && new Date(r.next_review_date) < now).length;
    const openConflicts = conflicts.filter(c => c.status !== 'resolved').length;
    const pendingReturns = returns.filter(r => r.status !== 'submitted' && new Date(r.due_date) > now).length;
    const overdueReturns = returns.filter(r => r.status !== 'submitted' && new Date(r.due_date) < now).length;

    return {
      reviews: { total: reviews.length, completed: reviews.filter(r => r.status === 'completed').length, overdue: overdueReviews },
      conflicts: { total: conflicts.length, open: openConflicts, resolved: conflicts.filter(c => c.status === 'resolved').length },
      returns: { total: returns.length, pending: pendingReturns, overdue: overdueReturns, submitted: returns.filter(r => r.status === 'submitted').length },
    };
  }
}
