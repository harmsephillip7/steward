import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { Dependent } from './entities/dependent.entity';
import { ClientAsset } from './entities/client-asset.entity';
import { Liability } from './entities/liability.entity';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { FinancialGoal } from './entities/financial-goal.entity';
import { LifeEvent } from './entities/life-event.entity';
import { IncomeExpense } from './entities/income-expense.entity';
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateClientComplianceDto,
  CreateDependentDto,
  CreateClientAssetDto,
  CreateLiabilityDto,
  CreateInsurancePolicyDto,
  CreateFinancialGoalDto,
  CreateLifeEventDto,
  CreateIncomeExpenseDto,
} from './dto/client.dto';
import { AuditService } from '../audit/audit.service';
import { Frequency } from '@steward/shared';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>,
    @InjectRepository(Dependent) private readonly dependentRepo: Repository<Dependent>,
    @InjectRepository(ClientAsset) private readonly assetRepo: Repository<ClientAsset>,
    @InjectRepository(Liability) private readonly liabilityRepo: Repository<Liability>,
    @InjectRepository(InsurancePolicy) private readonly insuranceRepo: Repository<InsurancePolicy>,
    @InjectRepository(FinancialGoal) private readonly goalRepo: Repository<FinancialGoal>,
    @InjectRepository(LifeEvent) private readonly lifeEventRepo: Repository<LifeEvent>,
    @InjectRepository(IncomeExpense) private readonly incomeExpenseRepo: Repository<IncomeExpense>,
    private readonly auditService: AuditService,
  ) {}

  // ── Client CRUD ──────────────────────────────────────────────────

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

  async update(id: string, advisorId: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id, advisorId);
    Object.assign(client, dto);
    const saved = await this.repo.save(client);
    await this.auditService.log(advisorId, 'client.updated', 'client', id, { changes: Object.keys(dto) });
    return saved;
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

  // ── Full Profile ─────────────────────────────────────────────────

  async getFullProfile(id: string, advisorId: string) {
    const client = await this.repo.findOne({
      where: { id, advisor_id: advisorId },
      relations: [
        'portfolios',
        'records_of_advice',
        'dependents',
        'assets',
        'liabilities',
        'insurance_policies',
        'financial_goals',
        'life_events',
        'income_expenses',
      ],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  // ── Net Worth ────────────────────────────────────────────────────

  async getNetWorth(id: string, advisorId: string) {
    await this.findOne(id, advisorId); // ownership check
    const assets = await this.assetRepo.find({ where: { client_id: id } });
    const liabilities = await this.liabilityRepo.find({ where: { client_id: id } });
    const totalAssets = assets.reduce((s, a) => s + Number(a.current_value), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.outstanding_balance), 0);
    return {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: totalAssets - totalLiabilities,
      assets_by_category: this.groupSum(assets, 'category', 'current_value'),
      liabilities_by_category: this.groupSum(liabilities, 'category', 'outstanding_balance'),
    };
  }

  // ── Cash Flow ────────────────────────────────────────────────────

  async getCashFlow(id: string, advisorId: string) {
    await this.findOne(id, advisorId);
    const items = await this.incomeExpenseRepo.find({ where: { client_id: id } });
    const toMonthly = (amount: number, freq: Frequency) => {
      switch (freq) {
        case Frequency.QUARTERLY: return amount / 3;
        case Frequency.ANNUALLY: return amount / 12;
        case Frequency.ONCE_OFF: return 0;
        default: return amount;
      }
    };
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    for (const item of items) {
      const monthly = toMonthly(Number(item.amount), item.frequency);
      if (item.type === 'income') monthlyIncome += monthly;
      else monthlyExpenses += monthly;
    }
    return {
      monthly_income: Math.round(monthlyIncome * 100) / 100,
      monthly_expenses: Math.round(monthlyExpenses * 100) / 100,
      monthly_surplus: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
      items,
    };
  }

  // ── Sub-entity CRUD helpers ──────────────────────────────────────

  // Dependents
  async addDependent(clientId: string, advisorId: string, dto: CreateDependentDto) {
    await this.findOne(clientId, advisorId);
    return this.dependentRepo.save(this.dependentRepo.create({ ...dto, client_id: clientId }));
  }
  async removeDependent(clientId: string, advisorId: string, depId: string) {
    await this.findOne(clientId, advisorId);
    await this.dependentRepo.delete({ id: depId, client_id: clientId });
  }
  async getDependents(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.dependentRepo.find({ where: { client_id: clientId } });
  }

  // Assets
  async addAsset(clientId: string, advisorId: string, dto: CreateClientAssetDto) {
    await this.findOne(clientId, advisorId);
    return this.assetRepo.save(this.assetRepo.create({ ...dto, client_id: clientId }));
  }
  async updateAsset(clientId: string, advisorId: string, assetId: string, dto: Partial<CreateClientAssetDto>) {
    await this.findOne(clientId, advisorId);
    await this.assetRepo.update({ id: assetId, client_id: clientId }, dto);
    return this.assetRepo.findOneBy({ id: assetId });
  }
  async removeAsset(clientId: string, advisorId: string, assetId: string) {
    await this.findOne(clientId, advisorId);
    await this.assetRepo.delete({ id: assetId, client_id: clientId });
  }
  async getAssets(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.assetRepo.find({ where: { client_id: clientId } });
  }

  // Liabilities
  async addLiability(clientId: string, advisorId: string, dto: CreateLiabilityDto) {
    await this.findOne(clientId, advisorId);
    return this.liabilityRepo.save(this.liabilityRepo.create({ ...dto, client_id: clientId }));
  }
  async updateLiability(clientId: string, advisorId: string, liabId: string, dto: Partial<CreateLiabilityDto>) {
    await this.findOne(clientId, advisorId);
    await this.liabilityRepo.update({ id: liabId, client_id: clientId }, dto);
    return this.liabilityRepo.findOneBy({ id: liabId });
  }
  async removeLiability(clientId: string, advisorId: string, liabId: string) {
    await this.findOne(clientId, advisorId);
    await this.liabilityRepo.delete({ id: liabId, client_id: clientId });
  }
  async getLiabilities(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.liabilityRepo.find({ where: { client_id: clientId } });
  }

  // Insurance
  async addInsurance(clientId: string, advisorId: string, dto: CreateInsurancePolicyDto) {
    await this.findOne(clientId, advisorId);
    return this.insuranceRepo.save(this.insuranceRepo.create({ ...dto, client_id: clientId }));
  }
  async updateInsurance(clientId: string, advisorId: string, polId: string, dto: Partial<CreateInsurancePolicyDto>) {
    await this.findOne(clientId, advisorId);
    await this.insuranceRepo.update({ id: polId, client_id: clientId }, dto);
    return this.insuranceRepo.findOneBy({ id: polId });
  }
  async removeInsurance(clientId: string, advisorId: string, polId: string) {
    await this.findOne(clientId, advisorId);
    await this.insuranceRepo.delete({ id: polId, client_id: clientId });
  }
  async getInsurance(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.insuranceRepo.find({ where: { client_id: clientId } });
  }

  // Goals
  async addGoal(clientId: string, advisorId: string, dto: CreateFinancialGoalDto) {
    await this.findOne(clientId, advisorId);
    return this.goalRepo.save(this.goalRepo.create({ ...dto, client_id: clientId }));
  }
  async updateGoal(clientId: string, advisorId: string, goalId: string, dto: Partial<CreateFinancialGoalDto>) {
    await this.findOne(clientId, advisorId);
    await this.goalRepo.update({ id: goalId, client_id: clientId }, dto);
    return this.goalRepo.findOneBy({ id: goalId });
  }
  async removeGoal(clientId: string, advisorId: string, goalId: string) {
    await this.findOne(clientId, advisorId);
    await this.goalRepo.delete({ id: goalId, client_id: clientId });
  }
  async getGoals(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.goalRepo.find({ where: { client_id: clientId } });
  }

  // Life Events
  async addLifeEvent(clientId: string, advisorId: string, dto: CreateLifeEventDto) {
    await this.findOne(clientId, advisorId);
    return this.lifeEventRepo.save(this.lifeEventRepo.create({ ...dto, client_id: clientId }));
  }
  async removeLifeEvent(clientId: string, advisorId: string, eventId: string) {
    await this.findOne(clientId, advisorId);
    await this.lifeEventRepo.delete({ id: eventId, client_id: clientId });
  }
  async getLifeEvents(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.lifeEventRepo.find({ where: { client_id: clientId }, order: { event_date: 'DESC' } });
  }
  async reviewLifeEvent(clientId: string, advisorId: string, eventId: string) {
    await this.findOne(clientId, advisorId);
    await this.lifeEventRepo.update({ id: eventId, client_id: clientId }, { reviewed_at: new Date() });
    return this.lifeEventRepo.findOneBy({ id: eventId });
  }

  // Income/Expenses
  async addIncomeExpense(clientId: string, advisorId: string, dto: CreateIncomeExpenseDto) {
    await this.findOne(clientId, advisorId);
    return this.incomeExpenseRepo.save(this.incomeExpenseRepo.create({ ...dto, client_id: clientId }));
  }
  async updateIncomeExpense(clientId: string, advisorId: string, ieId: string, dto: Partial<CreateIncomeExpenseDto>) {
    await this.findOne(clientId, advisorId);
    await this.incomeExpenseRepo.update({ id: ieId, client_id: clientId }, dto);
    return this.incomeExpenseRepo.findOneBy({ id: ieId });
  }
  async removeIncomeExpense(clientId: string, advisorId: string, ieId: string) {
    await this.findOne(clientId, advisorId);
    await this.incomeExpenseRepo.delete({ id: ieId, client_id: clientId });
  }
  async getIncomeExpenses(clientId: string, advisorId: string) {
    await this.findOne(clientId, advisorId);
    return this.incomeExpenseRepo.find({ where: { client_id: clientId } });
  }

  // ── Utility ──────────────────────────────────────────────────────

  private groupSum(items: any[], groupKey: string, valueKey: string): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of items) {
      const key = item[groupKey];
      result[key] = (result[key] || 0) + Number(item[valueKey]);
    }
    return result;
  }
}
