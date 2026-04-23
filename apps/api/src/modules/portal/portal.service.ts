import { Injectable, UnauthorizedException, NotFoundException, ConflictException, BadRequestException, GoneException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ClientPortalUser } from './entities/client-portal-user.entity';
import { ClientOnboardingToken } from './entities/client-onboarding-token.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(ClientPortalUser) private portalUserRepo: Repository<ClientPortalUser>,
    @InjectRepository(ClientOnboardingToken) private tokenRepo: Repository<ClientOnboardingToken>,
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

  // ── Onboarding Links ─────────────────────────────────────────

  /** Derive outstanding steps from client flags */
  getOutstandingSteps(client: Client): string[] {
    const steps: string[] = [];
    if (!client.kyc_complete) steps.push('kyc');
    if (!client.fica_complete) steps.push('fica');
    if (!client.source_of_wealth_declared) steps.push('source_of_wealth');
    if (!client.risk_profile_complete) steps.push('risk_profile');
    if (!client.id_number) steps.push('personal_details');
    return steps;
  }

  async getOutstandingStepsForClient(advisorId: string, clientId: string) {
    const client = await this.clientRepo.findOne({ where: { id: clientId, advisor_id: advisorId } });
    if (!client) throw new NotFoundException('Client not found');
    return { steps: this.getOutstandingSteps(client) };
  }

  async createOnboardingLink(advisorId: string, clientId: string, steps: string[], expiryDays = 30) {
    const client = await this.clientRepo.findOne({ where: { id: clientId, advisor_id: advisorId } });
    if (!client) throw new NotFoundException('Client not found');
    if (!steps.length) throw new BadRequestException('At least one step is required');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const record = this.tokenRepo.create({
      advisor_id: advisorId,
      client_id: clientId,
      steps,
      expires_at: expiresAt,
      completed_steps: [],
    });
    const saved = await this.tokenRepo.save(record);
    const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:3000';
    return {
      id: saved.id,
      token: saved.token,
      steps: saved.steps,
      expires_at: saved.expires_at,
      url: `${appUrl}/onboarding/${saved.token}`,
    };
  }

  async listOnboardingLinks(advisorId: string) {
    const records = await this.tokenRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.client', 'c')
      .where('t.advisor_id = :advisorId', { advisorId })
      .orderBy('t.created_at', 'DESC')
      .getMany();
    const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:3000';
    return records.map(r => ({
      ...r,
      url: `${appUrl}/onboarding/${r.token}`,
    }));
  }

  async revokeOnboardingLink(id: string, advisorId: string) {
    const record = await this.tokenRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!record) throw new NotFoundException('Link not found');
    await this.tokenRepo.remove(record);
    return { success: true };
  }

  /** Public: validate token and return steps + client name */
  async getOnboardingSession(token: string) {
    const record = await this.tokenRepo.findOne({ where: { token }, relations: ['client'] });
    if (!record) throw new NotFoundException('Invalid or expired link');
    if (record.is_used) throw new GoneException('This link has already been completed');
    if (new Date() > record.expires_at) throw new GoneException('This link has expired');

    return {
      client_name: `${record.client.first_name} ${record.client.last_name}`,
      steps: record.steps,
      completed_steps: record.completed_steps,
      expires_at: record.expires_at,
    };
  }

  /** Public: submit a completed step */
  async submitOnboardingStep(token: string, step: string, data: Record<string, any>) {
    const record = await this.tokenRepo.findOne({ where: { token }, relations: ['client'] });
    if (!record) throw new NotFoundException('Invalid or expired link');
    if (record.is_used) throw new GoneException('This link has already been completed');
    if (new Date() > record.expires_at) throw new GoneException('This link has expired');
    if (!record.steps.includes(step)) throw new BadRequestException('Step not in this link');

    const client = record.client;

    // Apply the step data to the client record
    switch (step) {
      case 'kyc':
        if (data.id_number) client.id_number = data.id_number;
        if (data.dob) client.dob = data.dob;
        client.kyc_complete = true;
        break;
      case 'fica':
        client.fica_complete = true;
        break;
      case 'source_of_wealth':
        client.source_of_wealth_declared = true;
        break;
      case 'risk_profile':
        if (data.risk_profile) client.risk_profile = data.risk_profile;
        client.risk_profile_complete = true;
        break;
      case 'personal_details':
        if (data.first_name) client.first_name = data.first_name;
        if (data.last_name) client.last_name = data.last_name;
        if (data.email) client.email = data.email;
        if (data.phone) client.phone = data.phone;
        if (data.id_number) client.id_number = data.id_number;
        if (data.dob) client.dob = data.dob;
        break;
    }

    await this.clientRepo.save(client);

    // Mark step complete on the token
    if (!record.completed_steps.includes(step)) {
      record.completed_steps = [...record.completed_steps, step];
    }

    // If all steps done, mark token as used
    const allDone = record.steps.every(s => record.completed_steps.includes(s));
    if (allDone) {
      record.is_used = true;
      record.completed_at = new Date();
    }

    await this.tokenRepo.save(record);
    return { completed_steps: record.completed_steps, all_done: allDone };
  }
}
