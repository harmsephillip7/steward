import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialPlan } from './entities/financial-plan.entity';
import { TaxCalculation } from './entities/tax-calculation.entity';
import { TaxService } from './tax.service';
import { RiskProfilingService } from './risk-profiling.service';
import { BehaviourService } from './behaviour.service';
import { RiskAnswer } from '@steward/shared';

@Injectable()
export class FinancialPlanningService {
  constructor(
    @InjectRepository(FinancialPlan)
    private readonly planRepo: Repository<FinancialPlan>,
    @InjectRepository(TaxCalculation)
    private readonly taxRepo: Repository<TaxCalculation>,
    private readonly taxService: TaxService,
    private readonly riskService: RiskProfilingService,
    private readonly behaviourService: BehaviourService,
  ) {}

  async createPlan(
    clientId: string,
    advisorId: string,
    riskAnswers: RiskAnswer[],
    behaviourAnswers: { question_id: number; answer_value: number }[],
    financials: {
      estate_value?: number;
      liquidity_needs?: number;
      monthly_income?: number;
      monthly_expenses?: number;
      taxable_income?: number;
      disposal_gain?: number;
      spouse_rebate?: number;
    },
  ): Promise<FinancialPlan> {
    const { score, profile, allocation } = this.riskService.scoreRiskProfile(riskAnswers);
    const behaviourProfile = this.behaviourService.assessBehaviourBias(behaviourAnswers);

    const plan = this.planRepo.create({
      client_id: clientId,
      advisor_id: advisorId,
      risk_profile: profile,
      risk_score: score,
      behaviour_profile: behaviourProfile as any,
      estate_value: financials.estate_value,
      liquidity_needs: financials.liquidity_needs,
      monthly_income: financials.monthly_income,
      monthly_expenses: financials.monthly_expenses,
      risk_answers: riskAnswers as any,
      behaviour_answers: behaviourAnswers as any,
    });
    const saved = await this.planRepo.save(plan);

    // Calculate taxes if inputs provided
    const incomeTax = financials.taxable_income
      ? this.taxService.calculateIncomeTax(financials.taxable_income)
      : null;
    const cgt = financials.disposal_gain
      ? this.taxService.calculateCGTWithMarginalRate(
          financials.disposal_gain,
          incomeTax?.marginal_rate ?? 0.18,
        )
      : null;
    const estateDuty = financials.estate_value
      ? this.taxService.calculateEstateDuty(financials.estate_value, financials.spouse_rebate)
      : null;

    const taxCalc = this.taxRepo.create({
      financial_plan_id: saved.id,
      income_tax: incomeTax?.net_tax,
      marginal_rate: incomeTax?.marginal_rate,
      effective_rate: incomeTax?.effective_rate,
      cgt_liability: cgt?.cgt_liability,
      estate_duty: estateDuty?.duty,
      tax_year: incomeTax?.tax_year ?? cgt?.tax_year,
      income_tax_breakdown: incomeTax as any,
      cgt_breakdown: cgt as any,
      estate_breakdown: estateDuty as any,
    });
    await this.taxRepo.save(taxCalc);

    return this.planRepo.findOne({
      where: { id: saved.id },
      relations: ['tax_calculation'],
    }) as Promise<FinancialPlan>;
  }

  getPlansForClient(clientId: string): Promise<FinancialPlan[]> {
    return this.planRepo.find({
      where: { client_id: clientId },
      relations: ['tax_calculation'],
      order: { created_at: 'DESC' },
    });
  }
}
