import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, Activity, Task } from './entities/crm.entities';
import { Proposal } from './entities/proposal.entity';
import { OnboardingChecklist } from './entities/onboarding-checklist.entity';
import { Client } from '../clients/entities/client.entity';
import { CreateLeadDto, UpdateLeadDto, CreateActivityDto, CreateTaskDto, CreateProposalDto, UpdateProposalDto } from './dto/crm.dto';
import { AuditService } from '../audit/audit.service';
import { LeadStage, OnboardingStatus, ProposalStatus } from '@steward/shared';

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
    @InjectRepository(OnboardingChecklist) private readonly onboardingRepo: Repository<OnboardingChecklist>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    private readonly auditService: AuditService,
  ) {}

  // ── Leads ────────────────────────────────────────────────────────

  async createLead(advisorId: string, dto: CreateLeadDto) {
    const lead = this.leadRepo.create({ ...dto, advisor_id: advisorId });
    const saved = await this.leadRepo.save(lead);
    await this.auditService.log(advisorId, 'lead.created', 'lead', saved.id);
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
    Object.assign(lead, dto);
    return this.leadRepo.save(lead);
  }

  async convertLead(id: string, advisorId: string) {
    const lead = await this.findOneLead(id, advisorId);
    if (lead.stage === LeadStage.WON) throw new BadRequestException('Lead already converted');

    // Create client from lead
    const client = this.clientRepo.create({
      advisor_id: advisorId,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
    });
    const savedClient = await this.clientRepo.save(client);

    // Update lead
    lead.stage = LeadStage.WON;
    lead.converted_client_id = savedClient.id;
    await this.leadRepo.save(lead);

    // Create onboarding checklist
    await this.createOnboarding(savedClient.id, advisorId);

    await this.auditService.log(advisorId, 'lead.converted', 'lead', id, { client_id: savedClient.id });
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
    return this.proposalRepo.save(this.proposalRepo.create({ ...dto, advisor_id: advisorId }));
  }

  findAllProposals(advisorId: string) {
    return this.proposalRepo.find({ where: { advisor_id: advisorId }, order: { created_at: 'DESC' } });
  }

  async findOneProposal(id: string, advisorId: string) {
    const p = await this.proposalRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!p) throw new NotFoundException('Proposal not found');
    return p;
  }

  async updateProposal(id: string, advisorId: string, dto: UpdateProposalDto) {
    const p = await this.findOneProposal(id, advisorId);
    Object.assign(p, dto);
    return this.proposalRepo.save(p);
  }

  async sendProposal(id: string, advisorId: string) {
    await this.proposalRepo.update({ id, advisor_id: advisorId }, { status: ProposalStatus.SENT, sent_at: new Date() });
    return this.proposalRepo.findOneBy({ id });
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
