import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { AdvisoryRecommendation } from './entities/advisory-recommendation.entity';
import { Client } from '../clients/entities/client.entity';
import { AuditService } from '../audit/audit.service';

const SYSTEM_PROMPT = `You are an expert South African financial advisor AI assistant. Analyse client data and provide actionable recommendations.
You must consider SA-specific factors:
- SA tax brackets, CGT inclusion rates, rebates
- Retirement fund contribution limits (27.5% / R350k)
- Estate duty (R3.5m abatement, 20%/25% rates)
- Section 12T tax-free savings (R36k/yr, R500k lifetime)
- FAIS compliance requirements
- Two-pot retirement system
- Regulation 28 limits

Return JSON array of recommendations, each with: category, priority, title, description, rationale, action_items (array of {step, completed:false}).
Categories: retirement, insurance, tax, estate, investment, debt, savings, emergency_fund, education_planning.
Priorities: critical, high, medium, low.`;

@Injectable()
export class AdvisoryService {
  private readonly logger = new Logger(AdvisoryService.name);
  private openai: OpenAI | null = null;

  constructor(
    @InjectRepository(AdvisoryRecommendation) private recRepo: Repository<AdvisoryRecommendation>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    private config: ConfigService,
    private audit: AuditService,
  ) {}

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = this.config.get<string>('OPENAI_API_KEY');
      if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  async generateRecommendations(advisorId: string, clientId: string, focusArea?: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId, advisor_id: advisorId },
      relations: ['dependents', 'assets', 'liabilities', 'insurance_policies', 'financial_goals', 'income_expenses'],
    });
    if (!client) throw new NotFoundException('Client not found');

    const profile = {
      name: `${client.first_name} ${client.last_name}`,
      age: client.dob ? Math.floor((Date.now() - new Date(client.dob).getTime()) / 31557600000) : null,
      marital_status: client.marital_status,
      employment_status: client.employment_status,
      occupation: client.occupation,
      annual_income: client.annual_gross_income,
      retirement_age_target: client.retirement_age_target,
      smoker: client.smoker,
      health_status: client.health_status,
      dependents: (client as any).dependents?.length || 0,
      total_assets: (client as any).assets?.reduce((s: number, a: any) => s + Number(a.current_value || 0), 0) || 0,
      total_liabilities: (client as any).liabilities?.reduce((s: number, l: any) => s + Number(l.outstanding_balance || 0), 0) || 0,
      insurance_cover: (client as any).insurance_policies?.reduce((s: number, p: any) => s + Number(p.cover_amount || 0), 0) || 0,
      monthly_insurance_premium: (client as any).insurance_policies?.reduce((s: number, p: any) => s + Number(p.monthly_premium || 0), 0) || 0,
      goals: (client as any).financial_goals?.map((g: any) => ({ name: g.name, category: g.category, target: g.target_amount, current: g.current_amount, target_date: g.target_date })) || [],
      monthly_income: (client as any).income_expenses?.filter((ie: any) => ie.type === 'income').reduce((s: number, ie: any) => s + Number(ie.amount || 0), 0) || 0,
      monthly_expenses: (client as any).income_expenses?.filter((ie: any) => ie.type === 'expense').reduce((s: number, ie: any) => s + Number(ie.amount || 0), 0) || 0,
    };

    const userPrompt = focusArea
      ? `Analyse this SA client and provide 3-5 recommendations focused on ${focusArea}:\n${JSON.stringify(profile)}`
      : `Analyse this SA client holistically and provide 5-8 recommendations across all areas:\n${JSON.stringify(profile)}`;

    try {
      const ai = this.getOpenAI();
      const completion = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content || '{"recommendations":[]}';
      const parsed = JSON.parse(content);
      const recs = parsed.recommendations || parsed;

      const saved: AdvisoryRecommendation[] = [];
      for (const rec of recs) {
        const entity = this.recRepo.create({
          advisor_id: advisorId,
          client_id: clientId,
          category: rec.category || 'investment',
          priority: rec.priority || 'medium',
          status: 'pending',
          title: rec.title,
          description: rec.description,
          rationale: rec.rationale,
          action_items: rec.action_items || [],
          ai_context: { model: 'gpt-4o-mini', focus_area: focusArea, generated_at: new Date() },
        });
        saved.push(await this.recRepo.save(entity));
      }

      await this.audit.log(advisorId, 'advisory_generated', 'client', clientId, {
        count: saved.length,
        focus_area: focusArea,
      });

      return { recommendations: saved, count: saved.length };
    } catch (err) {
      this.logger.error('AI advisory generation failed', err);
      throw err;
    }
  }

  async findByClient(clientId: string, advisorId: string, status?: string) {
    const where: any = { client_id: clientId, advisor_id: advisorId };
    if (status) where.status = status;
    return this.recRepo.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: string, advisorId: string) {
    const rec = await this.recRepo.findOne({ where: { id, advisor_id: advisorId } });
    if (!rec) throw new NotFoundException('Recommendation not found');
    return rec;
  }

  async update(id: string, advisorId: string, dto: any) {
    const rec = await this.findOne(id, advisorId);
    if (dto.status === 'implemented' && !rec.implemented_at) rec.implemented_at = new Date();
    if (dto.status === 'dismissed' && !rec.dismissed_at) { rec.dismissed_at = new Date(); rec.dismiss_reason = dto.dismiss_reason; }
    if (dto.status === 'reviewed' && !rec.reviewed_at) rec.reviewed_at = new Date();
    if (dto.action_items) rec.action_items = dto.action_items;
    if (dto.status) rec.status = dto.status;
    return this.recRepo.save(rec);
  }

  async getDashboardSummary(advisorId: string) {
    const all = await this.recRepo.find({ where: { advisor_id: advisorId } });
    const pending = all.filter(r => r.status === 'pending').length;
    const critical = all.filter(r => r.priority === 'critical' && r.status === 'pending').length;
    const implemented = all.filter(r => r.status === 'implemented').length;
    const byCategory = all.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return { total: all.length, pending, critical, implemented, byCategory };
  }
}
