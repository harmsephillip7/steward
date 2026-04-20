import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, Activity, Task } from './entities/crm.entities';
import { Proposal } from './entities/proposal.entity';
import { ProposalTemplate } from './entities/proposal-template.entity';
import { OnboardingChecklist } from './entities/onboarding-checklist.entity';
import { Client } from '../clients/entities/client.entity';
import { Dependent } from '../clients/entities/dependent.entity';
import { IncomeExpense } from '../clients/entities/income-expense.entity';
import { ClientAsset } from '../clients/entities/client-asset.entity';
import { Liability } from '../clients/entities/liability.entity';
import {
  CreateLeadDto, UpdateLeadDto, CreateActivityDto, CreateTaskDto,
  CreateProposalDto, UpdateProposalDto,
  CreateProposalTemplateDto, UpdateProposalTemplateDto,
} from './dto/crm.dto';
import { AuditService } from '../audit/audit.service';
import { LeadStage, OnboardingStatus, ProposalStatus, STAGE_GUIDANCE, computeStageProgress, IncomeExpenseType, Frequency } from '@steward/shared';
import type { StageHistoryEntry } from '@steward/shared';

const DEFAULT_ONBOARDING_ITEMS = [
  { key: 'id_copy', label: 'ID document (certified copy)', required: true, completed: false },
  { key: 'proof_of_address', label: 'Proof of residence (not older than 3 months)', required: true, completed: false },
  { key: 'proof_of_income', label: 'Proof of income / source of funds', required: true, completed: false },
  { key: 'fica', label: 'FICA verification', required: true, completed: false },
  { key: 'tax_number', label: 'Tax number verification', required: true, completed: false },
  { key: 'bank_confirmation', label: 'Bank confirmation letter', required: true, completed: false },
  { key: 'risk_profile', label: 'Risk profile questionnaire completed', required: true, completed: false },
  { key: 'fna', label: 'Financial Needs Analysis completed', required: true, completed: false },
  { key: 'roa', label: 'Record of Advice signed', required: true, completed: false },
  { key: 'mandate', label: 'Mandate / debit order instruction signed', required: true, completed: false },
  { key: 'application_forms', label: 'Product application forms submitted', required: false, completed: false },
  { key: 'section_14', label: 'Replacement policy disclosure (Section 14 notice)', required: false, completed: false },
];

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(Proposal) private readonly proposalRepo: Repository<Proposal>,
    @InjectRepository(ProposalTemplate) private readonly proposalTemplateRepo: Repository<ProposalTemplate>,
    @InjectRepository(OnboardingChecklist) private readonly onboardingRepo: Repository<OnboardingChecklist>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Dependent) private readonly dependentRepo: Repository<Dependent>,
    @InjectRepository(IncomeExpense) private readonly incomeExpenseRepo: Repository<IncomeExpense>,
    @InjectRepository(ClientAsset) private readonly clientAssetRepo: Repository<ClientAsset>,
    @InjectRepository(Liability) private readonly liabilityRepo: Repository<Liability>,
    private readonly auditService: AuditService,
  ) {}

  // ── Leads ────────────────────────────────────────────────────────

  async createLead(advisorId: string, dto: CreateLeadDto) {
    const initialStage = dto.stage || LeadStage.NEW;
    const stageHistory: StageHistoryEntry[] = [
      { stage: initialStage, entered_at: new Date().toISOString() },
    ];
    const lead = this.leadRepo.create({ ...dto, advisor_id: advisorId, stage_history: stageHistory });
    const saved = await this.leadRepo.save(lead);
    await this.auditService.log(advisorId, 'lead.created', 'lead', saved.id);
    // Generate auto-tasks for the initial stage
    await this.generateStageTasks(saved.id, advisorId, initialStage);
    return saved;
  }

  findAllLeads(advisorId: string, stage?: string, source?: string) {
    const qb = this.leadRepo.createQueryBuilder('lead')
      .where('lead.advisor_id = :advisorId', { advisorId })
      .orderBy('lead.created_at', 'DESC');
    if (stage) qb.andWhere('lead.stage = :stage', { stage });
    if (source) qb.andWhere('lead.source = :source', { source });
    return qb.getMany();
  }

  async findOneLead(id: string, advisorId: string) {
    const lead = await this.leadRepo.findOne({
      where: { id, advisor_id: advisorId },
      relations: ['activities', 'tasks'],
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateLead(id: string, advisorId: string, dto: UpdateLeadDto) {
    const lead = await this.findOneLead(id, advisorId);
    const previousStage = lead.stage;
    const newStage = dto.stage;

    // Merge discovery_data and analysis_data (shallow merge with existing)
    if (dto.discovery_data) {
      lead.discovery_data = { ...(lead.discovery_data || {}), ...dto.discovery_data };
      delete dto.discovery_data;
    }
    if (dto.analysis_data) {
      lead.analysis_data = { ...(lead.analysis_data || {}), ...dto.analysis_data };
      delete dto.analysis_data;
    }

    Object.assign(lead, dto);

    // Handle stage change
    if (newStage && newStage !== previousStage) {
      await this.onStageChange(lead, advisorId, previousStage, newStage);
    }

    return this.leadRepo.save(lead);
  }

  /**
   * Extensible stage-change hook. Called whenever a lead's stage changes.
   * Add notification triggers, webhook calls, etc. here in the future.
   */
  private async onStageChange(lead: Lead, advisorId: string, fromStage: LeadStage, toStage: LeadStage) {
    // 1. Update stage history
    const history = lead.stage_history || [];
    // Close the previous stage entry
    const currentEntry = history.find(h => h.stage === fromStage && !h.exited_at);
    if (currentEntry) {
      currentEntry.exited_at = new Date().toISOString();
    }
    // Add new stage entry
    history.push({ stage: toStage, entered_at: new Date().toISOString() });
    lead.stage_history = history;

    // 2. Generate auto-tasks for the new stage
    await this.generateStageTasks(lead.id, advisorId, toStage);

    // 3. Audit log
    await this.auditService.log(advisorId, 'lead.stage_changed', 'lead', lead.id, { from: fromStage, to: toStage });

    // Future extension point: notifications, webhooks, email triggers, etc.
  }

  /**
   * Create suggested tasks for a given pipeline stage.
   * Only creates tasks that don't already exist for this lead+stage.
   */
  private async generateStageTasks(leadId: string, advisorId: string, stage: LeadStage) {
    const guidance = STAGE_GUIDANCE[stage];
    if (!guidance) return;

    // Check which auto-tasks already exist for this lead+stage
    const existingTasks = await this.taskRepo.find({
      where: { lead_id: leadId, stage, is_auto: true },
    });
    const existingTitles = new Set(existingTasks.map(t => t.title));

    const newTasks = guidance.suggested_tasks
      .filter(st => !existingTitles.has(st.title))
      .map(st => this.taskRepo.create({
        lead_id: leadId,
        advisor_id: advisorId,
        title: st.title,
        description: st.description,
        priority: st.priority,
        stage,
        is_auto: true,
      }));

    if (newTasks.length > 0) {
      await this.taskRepo.save(newTasks);
    }
  }

  async convertLead(id: string, advisorId: string) {
    const lead = await this.findOneLead(id, advisorId);
    if (lead.converted_client_id) throw new BadRequestException('Lead already converted');

    const disc = lead.discovery_data || {};
    const anal = lead.analysis_data || {};

    // ── Build client record from discovery + analysis data ──
    const clientData: Record<string, any> = {
      advisor_id: advisorId,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
    };

    // Personal details from discovery
    if (disc.id_number) clientData.id_number = disc.id_number;
    if (disc.tax_number) clientData.tax_number = disc.tax_number;
    if (disc.date_of_birth) clientData.dob = disc.date_of_birth;
    if (disc.marital_status) {
      const msMap: Record<string, string> = {
        'Single': 'single', 'Married (COP)': 'married_cop', 'Married (AOP)': 'married_aop',
        'Divorced': 'divorced', 'Widowed': 'widowed', 'Life Partner': 'life_partner',
      };
      clientData.marital_status = msMap[disc.marital_status] || disc.marital_status;
    }
    if (disc.spouse_name) clientData.spouse_name = disc.spouse_name;
    if (disc.spouse_id_number) clientData.spouse_id_number = disc.spouse_id_number;
    if (disc.spouse_dob) clientData.spouse_dob = disc.spouse_dob;

    // Employment
    if (disc.employment_status) {
      const esMap: Record<string, string> = {
        'Employed': 'employed', 'Self-Employed': 'self_employed', 'Retired': 'retired',
        'Unemployed': 'unemployed', 'Student': 'student',
      };
      clientData.employment_status = esMap[disc.employment_status] || disc.employment_status;
    }
    if (disc.occupation) clientData.occupation = disc.occupation;
    if (disc.employer) clientData.employer = disc.employer;
    if (disc.industry) clientData.industry = disc.industry;
    if (disc.retirement_age_target) clientData.retirement_age_target = disc.retirement_age_target;

    // Tax
    if (disc.tax_residency) {
      clientData.tax_residency = disc.tax_residency === 'SA Resident' ? 'sa_resident' : 'non_resident';
    }

    // Health
    if (disc.smoker != null) clientData.smoker = disc.smoker;
    if (disc.health_status) {
      const hsMap: Record<string, string> = { 'Excellent': 'excellent', 'Good': 'good', 'Fair': 'fair', 'Poor': 'poor' };
      clientData.health_status = hsMap[disc.health_status] || disc.health_status;
    }

    // Income from analysis or discovery
    if (anal.income_breakdown?.salary) {
      const ib = anal.income_breakdown;
      const monthlyTotal = (ib.salary || 0) + (ib.bonus_commission || 0) + (ib.rental_income || 0) +
        (ib.investment_income || 0) + (ib.business_income || 0) + (ib.maintenance_received || 0) + (ib.other_income || 0);
      clientData.annual_gross_income = monthlyTotal * 12;
    } else if (disc.estimated_monthly_income) {
      clientData.annual_gross_income = disc.estimated_monthly_income * 12;
    }

    // Risk profile from analysis
    if (anal.risk_tolerance_preliminary) {
      clientData.risk_profile = anal.risk_tolerance_preliminary.toLowerCase().replace(/-/g, '_');
    }

    // Notes
    const notesParts: string[] = [];
    if (disc.family_situation) notesParts.push(`Family: ${disc.family_situation}`);
    if (disc.health_conditions) notesParts.push(`Health: ${disc.health_conditions}`);
    if (disc.meeting_notes) notesParts.push(`Discovery Notes: ${disc.meeting_notes}`);
    if (anal.analysis_notes) notesParts.push(`Analysis Notes: ${anal.analysis_notes}`);
    if (notesParts.length > 0) clientData.notes = notesParts.join('\n\n');

    const client = this.clientRepo.create(clientData);
    const savedClient = await this.clientRepo.save(client);

    // ── Auto-create Dependents from discovery ──
    if (disc.dependents_details?.length) {
      const depMap: Record<string, string> = { 'Child': 'child', 'Spouse': 'spouse', 'Parent': 'parent', 'Sibling': 'sibling', 'Other': 'other' };
      const deps = disc.dependents_details.map(d => this.dependentRepo.create({
        client_id: savedClient.id,
        name: d.name || 'Unknown',
        relationship: (depMap[d.relationship || ''] || 'other') as any,
        dob: d.dob ? new Date(d.dob) : undefined,
        is_student: d.is_student || false,
        special_needs: d.special_needs || false,
        monthly_support_amount: d.monthly_support_amount,
      }));
      await this.dependentRepo.save(deps);
    }

    // ── Auto-create Income/Expense records from analysis breakdowns ──
    if (anal.income_breakdown) {
      const ib = anal.income_breakdown;
      const incomeEntries: { category: string; amount: number }[] = [];
      if (ib.salary) incomeEntries.push({ category: 'Salary', amount: ib.salary });
      if (ib.bonus_commission) incomeEntries.push({ category: 'Bonus/Commission', amount: ib.bonus_commission });
      if (ib.rental_income) incomeEntries.push({ category: 'Rental Income', amount: ib.rental_income });
      if (ib.investment_income) incomeEntries.push({ category: 'Investment Income', amount: ib.investment_income });
      if (ib.business_income) incomeEntries.push({ category: 'Business Income', amount: ib.business_income });
      if (ib.maintenance_received) incomeEntries.push({ category: 'Maintenance Received', amount: ib.maintenance_received });
      if (ib.other_income) incomeEntries.push({ category: 'Other Income', amount: ib.other_income });

      const records = incomeEntries.map(e => this.incomeExpenseRepo.create({
        client_id: savedClient.id,
        type: IncomeExpenseType.INCOME,
        category: e.category,
        amount: e.amount,
        frequency: Frequency.MONTHLY,
        is_recurring: true,
      }));
      if (records.length) await this.incomeExpenseRepo.save(records);
    }

    if (anal.expense_breakdown) {
      const eb = anal.expense_breakdown;
      const expenseEntries: { category: string; amount: number }[] = [];
      if (eb.housing) expenseEntries.push({ category: 'Housing', amount: eb.housing });
      if (eb.transport) expenseEntries.push({ category: 'Transport', amount: eb.transport });
      if (eb.food_groceries) expenseEntries.push({ category: 'Food & Groceries', amount: eb.food_groceries });
      if (eb.medical) expenseEntries.push({ category: 'Medical', amount: eb.medical });
      if (eb.insurance_premiums) expenseEntries.push({ category: 'Insurance Premiums', amount: eb.insurance_premiums });
      if (eb.education_school_fees) expenseEntries.push({ category: 'Education/School Fees', amount: eb.education_school_fees });
      if (eb.entertainment_lifestyle) expenseEntries.push({ category: 'Entertainment & Lifestyle', amount: eb.entertainment_lifestyle });
      if (eb.debt_repayments) expenseEntries.push({ category: 'Debt Repayments', amount: eb.debt_repayments });
      if (eb.savings_investments) expenseEntries.push({ category: 'Savings & Investments', amount: eb.savings_investments });
      if (eb.other_expenses) expenseEntries.push({ category: 'Other Expenses', amount: eb.other_expenses });

      const records = expenseEntries.map(e => this.incomeExpenseRepo.create({
        client_id: savedClient.id,
        type: IncomeExpenseType.EXPENSE,
        category: e.category,
        amount: e.amount,
        frequency: Frequency.MONTHLY,
        is_recurring: true,
      }));
      if (records.length) await this.incomeExpenseRepo.save(records);
    }

    // ── Auto-create Asset records from analysis ──
    if (anal.assets_details?.length) {
      const catMap: Record<string, string> = {
        'Property': 'property', 'Vehicle': 'vehicle', 'Investment': 'investment',
        'Retirement Fund': 'retirement_fund', 'TFSA': 'tfsa', 'RA': 'ra',
        'Savings': 'savings', 'Business': 'business', 'Collectible': 'collectible', 'Other': 'other',
      };
      const assets = anal.assets_details
        .filter(a => a.current_value)
        .map(a => this.clientAssetRepo.create({
          client_id: savedClient.id,
          category: (catMap[a.category || ''] || 'other') as any,
          description: a.description || 'Asset',
          provider: a.provider,
          current_value: a.current_value,
          monthly_contribution: a.monthly_contribution,
        }));
      if (assets.length) await this.clientAssetRepo.save(assets);
    }

    // ── Auto-create Liability records from analysis ──
    if (anal.liabilities_details?.length) {
      const catMap: Record<string, string> = {
        'Mortgage': 'mortgage', 'Vehicle Finance': 'vehicle_finance', 'Personal Loan': 'personal_loan',
        'Credit Card': 'credit_card', 'Student Loan': 'student_loan', 'Overdraft': 'overdraft', 'Other': 'other',
      };
      const liabs = anal.liabilities_details
        .filter(l => l.outstanding_balance)
        .map(l => this.liabilityRepo.create({
          client_id: savedClient.id,
          category: (catMap[l.category || ''] || 'other') as any,
          description: l.description || 'Liability',
          provider: l.provider,
          outstanding_balance: l.outstanding_balance,
          monthly_repayment: l.monthly_repayment || 0,
          interest_rate: l.interest_rate,
        }));
      if (liabs.length) await this.liabilityRepo.save(liabs);
    }

    // Track stage change to WON
    const previousStage = lead.stage;
    lead.stage = LeadStage.WON;
    lead.converted_client_id = savedClient.id;
    if (previousStage !== LeadStage.WON) {
      await this.onStageChange(lead, advisorId, previousStage, LeadStage.WON);
    }
    await this.leadRepo.save(lead);

    // Create onboarding checklist
    await this.createOnboarding(savedClient.id, advisorId);

    await this.auditService.log(advisorId, 'lead.converted', 'lead', id, { client_id: savedClient.id, from_stage: previousStage });
    return { lead, client: savedClient };
  }

  async getPipeline(advisorId: string) {
    const leads = await this.leadRepo.find({ where: { advisor_id: advisorId } });
    const stages = Object.values(LeadStage);
    const pipeline = stages.map(stage => {
      const stageLeads = leads.filter(l => l.stage === stage);
      return {
        stage,
        count: stageLeads.length,
        total_value: stageLeads.reduce((s, l) => s + Number(l.expected_value || 0), 0),
        leads: stageLeads,
      };
    });
    return pipeline;
  }

  async getStageProgress(id: string, advisorId: string) {
    const lead = await this.findOneLead(id, advisorId);
    const guidance = STAGE_GUIDANCE[lead.stage];
    const progress = computeStageProgress(lead as any, lead.stage);

    // Calculate time in current stage
    const currentHistoryEntry = (lead.stage_history || []).find(h => h.stage === lead.stage && !h.exited_at);
    const timeInStage = currentHistoryEntry
      ? Math.floor((Date.now() - new Date(currentHistoryEntry.entered_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get stage-specific tasks
    const stageTasks = (lead.tasks || []).filter(t => t.stage === lead.stage);
    const tasksCompleted = stageTasks.filter(t => t.completed_at).length;

    return {
      current_stage: lead.stage,
      guidance,
      progress,
      time_in_stage_days: timeInStage,
      stage_tasks: { total: stageTasks.length, completed: tasksCompleted },
      stage_history: lead.stage_history || [],
    };
  }

  // ── Activities ───────────────────────────────────────────────────

  async createActivity(advisorId: string, dto: CreateActivityDto) {
    return this.activityRepo.save(this.activityRepo.create({ ...dto, advisor_id: advisorId }));
  }

  getActivities(advisorId: string, leadId?: string, clientId?: string) {
    const where: any = { advisor_id: advisorId };
    if (leadId) where.lead_id = leadId;
    if (clientId) where.client_id = clientId;
    return this.activityRepo.find({ where, order: { created_at: 'DESC' } });
  }

  async completeActivity(id: string, advisorId: string) {
    await this.activityRepo.update({ id, advisor_id: advisorId }, { completed_at: new Date() });
    return this.activityRepo.findOneBy({ id });
  }

  // ── Tasks ────────────────────────────────────────────────────────

  async createTask(advisorId: string, dto: CreateTaskDto) {
    return this.taskRepo.save(this.taskRepo.create({ ...dto, advisor_id: advisorId }));
  }

  getTasks(advisorId: string, completed?: boolean) {
    const qb = this.taskRepo.createQueryBuilder('task')
      .where('task.advisor_id = :advisorId', { advisorId })
      .orderBy('task.due_date', 'ASC');
    if (completed === false) qb.andWhere('task.completed_at IS NULL');
    if (completed === true) qb.andWhere('task.completed_at IS NOT NULL');
    return qb.getMany();
  }

  async completeTask(id: string, advisorId: string) {
    await this.taskRepo.update({ id, advisor_id: advisorId }, { completed_at: new Date() });
    return this.taskRepo.findOneBy({ id });
  }

  async deleteTask(id: string, advisorId: string) {
    await this.taskRepo.delete({ id, advisor_id: advisorId });
  }

  // ── Proposals ────────────────────────────────────────────────────

  async createProposal(advisorId: string, dto: CreateProposalDto) {
    const proposal = this.proposalRepo.create({ ...dto, advisor_id: advisorId });
    const saved = await this.proposalRepo.save(proposal);
    return this.findOneProposal(saved.id, advisorId);
  }

  findAllProposals(advisorId: string) {
    return this.proposalRepo.find({
      where: { advisor_id: advisorId },
      relations: ['lead', 'client', 'advisor'],
      order: { created_at: 'DESC' },
    });
  }

  async findOneProposal(id: string, advisorId: string) {
    const p = await this.proposalRepo.findOne({
      where: { id, advisor_id: advisorId },
      relations: ['lead', 'client', 'advisor', 'template'],
    });
    if (!p) throw new NotFoundException('Proposal not found');
    return p;
  }

  async updateProposal(id: string, advisorId: string, dto: UpdateProposalDto) {
    const p = await this.findOneProposal(id, advisorId);
    Object.assign(p, dto);
    await this.proposalRepo.save(p);
    return this.findOneProposal(id, advisorId);
  }

  async sendProposal(id: string, advisorId: string) {
    await this.proposalRepo.update({ id, advisor_id: advisorId }, { status: ProposalStatus.SENT, sent_at: new Date() });
    return this.findOneProposal(id, advisorId);
  }

  // ── Proposal Templates ──────────────────────────────────────────

  async createProposalTemplate(advisorId: string, dto: CreateProposalTemplateDto) {
    if (dto.is_default) {
      await this.proposalTemplateRepo.update({ advisor_id: advisorId, is_default: true }, { is_default: false });
    }
    return this.proposalTemplateRepo.save(this.proposalTemplateRepo.create({ ...dto, advisor_id: advisorId }));
  }

  findAllProposalTemplates(advisorId: string) {
    return this.proposalTemplateRepo.find({ where: { advisor_id: advisorId }, order: { is_default: 'DESC', name: 'ASC' } });
  }

  async findOneProposalTemplate(id: string, advisorId: string) {
    const t = await this.proposalTemplateRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!t) throw new NotFoundException('Proposal template not found');
    return t;
  }

  async updateProposalTemplate(id: string, advisorId: string, dto: UpdateProposalTemplateDto) {
    const t = await this.findOneProposalTemplate(id, advisorId);
    if (dto.is_default) {
      await this.proposalTemplateRepo.update({ advisor_id: advisorId, is_default: true }, { is_default: false });
    }
    Object.assign(t, dto);
    return this.proposalTemplateRepo.save(t);
  }

  async deleteProposalTemplate(id: string, advisorId: string) {
    await this.findOneProposalTemplate(id, advisorId);
    await this.proposalTemplateRepo.delete({ id, advisor_id: advisorId });
  }

  // ── Onboarding ───────────────────────────────────────────────────

  async createOnboarding(clientId: string, advisorId: string) {
    const existing = await this.onboardingRepo.findOne({ where: { client_id: clientId } });
    if (existing) return existing;
    return this.onboardingRepo.save(this.onboardingRepo.create({
      client_id: clientId,
      advisor_id: advisorId,
      items: DEFAULT_ONBOARDING_ITEMS,
    }));
  }

  async getOnboarding(clientId: string, advisorId: string) {
    const checklist = await this.onboardingRepo.findOne({ where: { client_id: clientId, advisor_id: advisorId } });
    if (!checklist) throw new NotFoundException('Onboarding checklist not found');
    return checklist;
  }

  async updateOnboardingItem(clientId: string, advisorId: string, itemKey: string, completed: boolean) {
    const checklist = await this.getOnboarding(clientId, advisorId);
    const item = checklist.items.find(i => i.key === itemKey);
    if (!item) throw new NotFoundException('Checklist item not found');
    item.completed = completed;
    item.completed_at = completed ? new Date().toISOString() : undefined;

    // Check if all required items are completed
    const allRequired = checklist.items.filter(i => i.required).every(i => i.completed);
    if (allRequired) {
      checklist.status = OnboardingStatus.COMPLETED;
      checklist.completed_at = new Date();
    }

    return this.onboardingRepo.save(checklist);
  }
}
