import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordOfAdvice } from './entities/record-of-advice.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(RecordOfAdvice)
    private readonly roaRepo: Repository<RecordOfAdvice>,
    private readonly auditService: AuditService,
  ) {}

  async createROA(
    clientId: string,
    advisorId: string,
    adviceSummary: string,
  ): Promise<RecordOfAdvice> {
    const roa = this.roaRepo.create({
      client_id: clientId,
      advisor_id: advisorId,
      advice_date: new Date(),
      advice_summary: adviceSummary,
    });
    const saved = await this.roaRepo.save(roa);
    await this.auditService.log(advisorId, 'roa.created', 'record_of_advice', saved.id, undefined, undefined, clientId);
    return saved;
  }

  async signROA(
    roaId: string,
    advisorId: string,
    signatureData?: string,
  ): Promise<RecordOfAdvice> {
    await this.roaRepo.update(roaId, {
      signed_at: new Date(),
      client_signature: signatureData,
    });
    const updated = await this.roaRepo.findOne({ where: { id: roaId } });
    await this.auditService.log(advisorId, 'roa.signed', 'record_of_advice', roaId);
    return updated!;
  }

  async updateROAPdfUrl(roaId: string, pdfUrl: string): Promise<void> {
    await this.roaRepo.update(roaId, { pdf_url: pdfUrl });
  }

  getROAHistory(clientId: string): Promise<RecordOfAdvice[]> {
    return this.roaRepo.find({
      where: { client_id: clientId },
      order: { created_at: 'DESC' },
    });
  }
}
