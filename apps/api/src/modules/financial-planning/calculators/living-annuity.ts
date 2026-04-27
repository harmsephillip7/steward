import { LIVING_ANNUITY_MIN, LIVING_ANNUITY_MAX } from '../sa-tax-constants';

export interface LivingAnnuityInput {
  capital: number;
  draw_pct: number; // 0.025–0.175
  /** Real return on assets. */
  real_return: number;
  /** Years to project. */
  years: number;
}

export interface LivingAnnuityYear {
  year: number;
  age_offset: number;
  opening_balance: number;
  income: number;
  growth: number;
  closing_balance: number;
}

export interface LivingAnnuityOutput {
  initial_annual_income: number;
  initial_monthly_income: number;
  draw_pct_valid: boolean;
  schedule: LivingAnnuityYear[];
  capital_exhausted_at_year?: number;
}

/**
 * Project a living annuity at a fixed real draw % per year.
 * SARS rules: draw% between 2.5% and 17.5%, set on anniversary.
 */
export function livingAnnuityProjection(input: LivingAnnuityInput): LivingAnnuityOutput {
  const valid =
    input.draw_pct >= LIVING_ANNUITY_MIN - 1e-9 && input.draw_pct <= LIVING_ANNUITY_MAX + 1e-9;

  const schedule: LivingAnnuityYear[] = [];
  let bal = input.capital;
  let exhausted: number | undefined;

  const initialIncome = input.capital * input.draw_pct;

  for (let y = 1; y <= input.years; y++) {
    const opening = bal;
    const income = opening * input.draw_pct;
    const afterDraw = opening - income;
    const growth = afterDraw * input.real_return;
    const closing = afterDraw + growth;
    schedule.push({
      year: y,
      age_offset: y - 1,
      opening_balance: round2(opening),
      income: round2(income),
      growth: round2(growth),
      closing_balance: round2(Math.max(0, closing)),
    });
    bal = closing;
    if (bal <= 0 && exhausted === undefined) exhausted = y;
  }

  return {
    initial_annual_income: round2(initialIncome),
    initial_monthly_income: round2(initialIncome / 12),
    draw_pct_valid: valid,
    schedule,
    capital_exhausted_at_year: exhausted,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
