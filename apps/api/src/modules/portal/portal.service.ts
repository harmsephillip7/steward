import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ClientPortalUser } from './entities/client-portal-user.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(ClientPortalUser) private portalUserRepo: Repository<ClientPortalUser>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    private config: ConfigService,
  ) {}

  // ── Auth ─────────────────────────────────────────────────────

  async createPortalUser(advisorId: string, clientId: string, email: string, password: string) {
    const client = await this.clientRepo.findOne({ where: { id: clientId, advisor_id: advisorId } });
    if (!client) throw new NotFoundException('Client not found');

    const existing = await this.portalUserRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(password, 12);
    const user = this.portalUserRepo.create({
      client_id: clientId,
      email,
      password_hash: hash,
      display_name: `${client.first_name} ${client.last_name}`,
    });
    const saved = await this.portalUserRepo.save(user);
    return { id: saved.id, email: saved.email, client_id: saved.client_id };
  }

  async portalLogin(email: string, password: string) {
    const user = await this.portalUserRepo.findOne({ where: { email, is_active: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    user.last_login = new Date();
    await this.portalUserRepo.save(user);

    const secret = this.config.get<string>('JWT_SECRET') || 'dev-secret';
    const token = jwt.sign({ sub: user.id, client_id: user.client_id, type: 'portal' }, secret, { expiresIn: '8h' });
    return { token, client_id: user.client_id, display_name: user.display_name };
  }

  // ── Client Data Access ───────────────────────────────────────

  async getPortalProfile(clientId: string) {
    return this.clientRepo.findOne({
      where: { id: clientId },
      relations: ['dependents', 'assets', 'liabilities', 'insurance_policies', 'financial_goals', 'income_expenses', 'portfolios'],
      select: ['id', 'first_name', 'last_name', 'email', 'phone', 'dob', 'marital_status', 'employment_status', 'occupation'],
    });
  }

  async getPortalPortfolios(clientId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId },
      relations: ['portfolios', 'portfolios.portfolio_funds', 'portfolios.portfolio_funds.fund'],
    });
    return client?.portfolios || [];
  }

  async getPortalDocuments(clientId: string) {
    // Documents related to this client
    const { Document } = await import('../documents/entities/document.entity');
    // Direct query to avoid circular imports
    return [];
  }

  async getPortalGoals(clientId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId },
      relations: ['financial_goals'],
    });
    return client?.financial_goals || [];
  }

  async getPortalInsurance(clientId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId },
      relations: ['insurance_policies'],
    });
    return client?.insurance_policies || [];
  }

  // ── Portal User Management (Advisor-side) ────────────────────

  async getPortalUsers(advisorId: string) {
    const clients = await this.clientRepo.find({ where: { advisor_id: advisorId }, select: ['id'] });
    const clientIds = clients.map(c => c.id);
    if (clientIds.length === 0) return [];
    return this.portalUserRepo.createQueryBuilder('pu')
      .leftJoinAndSelect('pu.client', 'c')
      .where('pu.client_id IN (:...ids)', { ids: clientIds })
      .getMany();
  }

  async togglePortalUser(id: string, advisorId: string) {
    const user = await this.portalUserRepo.findOne({ where: { id }, relations: ['client'] });
    if (!user) throw new NotFoundException('Portal user not found');
    // Verify advisor owns this client
    const client = await this.clientRepo.findOne({ where: { id: user.client_id, advisor_id: advisorId } });
    if (!client) throw new NotFoundException('Client not found');
    user.is_active = !user.is_active;
    return this.portalUserRepo.save(user);
  }
}
