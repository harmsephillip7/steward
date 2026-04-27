import { pvAnnuity, fvLumpSum } from './retirement';

export interface LifeCoverInput {
  /** Net monthly income family needs to maintain lifestyle (today's rands). */
  required_monthly_income: number;
  /** Years of replacement (typically until youngest dependent independent or spouse retirement). */
  replacement_years: number;
  /** Real net return on capital paid out. */
  real_return: number;
  /** Outstanding liabilities to settle on death (bond, vehicles, credit). */
  liabilities: number;
  /** One-off costs (funeral, estate winding-up, executor fee). */
  final_expenses: number;
  /** Education fund still needed (today's rands). */
  education_fund_needed: number;
  /** Existing life cover & liquid assets that offset the need. */
  existing_cover: number;
  liquid_assets: number;
  /** Estimated estate duty + executor fee impact (rand). */
  estate_costs?: number;
}

export interface LifeCoverOutput {
  income_replacement_capital: number;
  total_required: number;
  total_available: number;
  shortfall: number;
}

/** Total life cover required = capitalised income need + liabilities + final + education + estate. */
export function lifeCoverNeed(input: LifeCoverInput): LifeCoverOutput {
  const incomeCapital = pvAnnuity(
    input.required_monthly_income,
    input.real_return,
    input.replacement_years,
  );
  const totalRequired =
    incomeCapital +
    (input.liabilities || 0) +
    (input.final_expenses || 0) +
    (input.education_fund_needed || 0) +
    (input.estate_costs || 0);
  const totalAvailable = (input.existing_cover || 0) + (input.liquid_assets || 0);
  const shortfall = Math.max(0, totalRequired - totalAvailable);

  return {
    income_replacement_capital: round2(incomeCapital),
    total_required: round2(totalRequired),
    total_available: round2(totalAvailable),
    shortfall: round2(shortfall),
  };
}

export interface DisabilityInput {
  /** Net monthly income to replace until retirement. */
  required_monthly_income: number;
  current_age: number;
  retirement_age: number;
  real_return: number;
  existing_disability_capital: number;
  /** Existing income-replacement (PHI) — captured as monthly amount; pv'd separately. */
  existing_phi_monthly?: number;
}

export interface DisabilityOutput {
  years_to_retirement: number;
  capitalised_income_need: number;
  capitalised_phi_offset: number;
  shortfall: number;
}

/** Disability lump-sum (capital disability) need. */
export function disabilityNeed(input: DisabilityInput): DisabilityOutput {
  const years = Math.max(0, input.retirement_age - input.current_age);
  const need = pvAnnuity(input.required_monthly_income, input.real_return, years);
  const phi = pvAnnuity(input.existing_phi_monthly ?? 0, input.real_return, years);
  const shortfall = Math.max(0, need - input.existing_disability_capital - phi);
  return {
    years_to_retirement: years,
    capitalised_income_need: round2(need),
    capitalised_phi_offset: round2(phi),
    shortfall: round2(shortfall),
  };
}

export interface DreadDiseaseInput {
  /** Recommended cover usually 1× annual income or lifestyle adjustment lump sum. */
  recommended_multiplier_of_income: number;
  annual_income: number;
  existing_cover: number;
}

export interface DreadDiseaseOutput {
  recommended: number;
  shortfall: number;
}

export function dreadDiseaseNeed(input: DreadDiseaseInput): DreadDiseaseOutput {
  const recommended = input.annual_income * input.recommended_multiplier_of_income;
  return {
    recommended: round2(recommended),
    shortfall: round2(Math.max(0, recommended - input.existing_cover)),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
