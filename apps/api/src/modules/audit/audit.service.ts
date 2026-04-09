import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(
    advisorId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    clientId?: string,
  ): Promise<void> {
    const entry = this.repo.create({
      advisor_id: advisorId,
      client_id: clientId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      metadata,
    });
    await this.repo.save(entry);
  }

  getLog(filters: { advisorId?: string; clientId?: string }): Promise<AuditLog[]> {
    const where: Partial<AuditLog> = {};
    if (filters.advisorId) where.advisor_id = filters.advisorId;
    if (filters.clientId) where.client_id = filters.clientId;
    return this.repo.find({
      where,
      order: { timestamp: 'DESC' },
      take: 200,
    });
  }
}
