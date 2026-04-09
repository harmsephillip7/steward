import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientComplianceDto } from './dto/client.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
    private readonly auditService: AuditService,
  ) {}

  async create(advisorId: string, dto: CreateClientDto): Promise<Client> {
    const client = this.repo.create({ ...dto, advisor_id: advisorId });
    const saved = await this.repo.save(client);
    await this.auditService.log(advisorId, 'client.created', 'client', saved.id);
    return saved;
  }

  findAllByAdvisor(advisorId: string): Promise<Client[]> {
    return this.repo.find({
      where: { advisor_id: advisorId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, advisorId: string): Promise<Client> {
    const client = await this.repo.findOne({
      where: { id, advisor_id: advisorId },
      relations: ['portfolios', 'records_of_advice'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async updateCompliance(
    id: string,
    advisorId: string,
    dto: UpdateClientComplianceDto,
  ): Promise<Client> {
    const client = await this.findOne(id, advisorId);
    Object.assign(client, dto);
    if (dto.risk_profile) {
      client.risk_profile_complete = true;
    }
    const saved = await this.repo.save(client);
    await this.auditService.log(advisorId, 'client.compliance_updated', 'client', id, { changes: dto });
    return saved;
  }

  getComplianceStatus(client: Client): {
    passed: boolean;
    failed_checks: string[];
  } {
    const failed_checks: string[] = [];
    if (!client.kyc_complete) failed_checks.push('KYC not complete');
    if (!client.fica_complete) failed_checks.push('FICA documents not uploaded');
    if (!client.source_of_wealth_declared) failed_checks.push('Source of wealth not declared');
    if (!client.risk_profile_complete) failed_checks.push('Risk profile not completed');
    return { passed: failed_checks.length === 0, failed_checks };
  }
}
