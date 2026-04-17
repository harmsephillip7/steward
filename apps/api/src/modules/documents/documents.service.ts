import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private docRepo: Repository<Document>,
    private audit: AuditService,
  ) {}

  async create(advisorId: string, dto: CreateDocumentDto) {
    const doc = this.docRepo.create({ ...dto, advisor_id: advisorId, uploaded_by: advisorId });
    const saved = await this.docRepo.save(doc);
    await this.audit.log(advisorId, 'document_uploaded', 'document', saved.id, { name: dto.name, type: dto.type });
    return saved;
  }

  async findAll(advisorId: string, clientId?: string, type?: string) {
    const qb = this.docRepo.createQueryBuilder('d').where('d.advisor_id = :advisorId', { advisorId });
    if (clientId) qb.andWhere('d.client_id = :clientId', { clientId });
    if (type) qb.andWhere('d.type = :type', { type });
    return qb.orderBy('d.created_at', 'DESC').getMany();
  }

  async findOne(id: string, advisorId: string) {
    const doc = await this.docRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async findByClient(clientId: string, advisorId: string) {
    return this.docRepo.find({ where: { client_id: clientId, advisor_id: advisorId }, order: { created_at: 'DESC' } });
  }

  async update(id: string, advisorId: string, dto: UpdateDocumentDto) {
    const doc = await this.findOne(id, advisorId);
    Object.assign(doc, dto);
    return this.docRepo.save(doc);
  }

  async remove(id: string, advisorId: string) {
    const doc = await this.findOne(id, advisorId);
    await this.docRepo.remove(doc);
    await this.audit.log(advisorId, 'document_deleted', 'document', id, { name: doc.name });
    return { deleted: true };
  }

  async getStats(advisorId: string) {
    const docs = await this.docRepo.find({ where: { advisor_id: advisorId } });
    const byType = docs.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalSize = docs.reduce((s, d) => s + (d.file_size || 0), 0);
    const expiring = docs.filter(d => d.expiry_date && new Date(d.expiry_date) <= new Date(Date.now() + 30 * 86400000)).length;
    return { total: docs.length, byType, totalSize, expiringSoon: expiring };
  }
}
