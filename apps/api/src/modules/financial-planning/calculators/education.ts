import { fvAnnuity, fvLumpSum, requiredContribution } from './retirement';

export interface EducationGoalInput {
  child_current_age: number;
  start_age: number; // typically 18
  years_of_study: number;
  /** Annual cost in TODAY's rands (tuition + accommodation + books). */
  annual_cost_today: number;
  /** Education-cost inflation real (above CPI). Typically 2-4%. */
  real_education_inflation: number;
  /** Real return assumed on the savings vehicle (TFSA / unit trust). */
  real_return: number;
  current_savings: number;
  current_monthly_contribution: number;
}

export interface EducationGoalOutput {
  years_to_start: number;
  total_cost_at_start_today_rands: number;
  required_capital_at_start: number;
  projected_capital_at_start: number;
  shortfall: number;
  required_monthly_contribution: number;
}

/**
 * Education planning. Returns the capital needed at start of studies plus
 * the shortfall vs current trajectory. All numbers in TODAY's rands; the
 * real_education_inflation captures fees rising faster than CPI.
 */
export function educationGoal(input: EducationGoalInput): EducationGoalOutput {
  const yearsToStart = Math.max(0, input.start_age - input.child_current_age);

  // Cost per year of study in today's rands grows at education inflation.
  // We sum each year's escalated cost to produce a lump-sum requirement at start.
  let lumpSum = 0;
  for (let i = 0; i < input.years_of_study; i++) {
    const yrFromNow = yearsToStart + i;
    lumpSum += input.annual_cost_today * Math.pow(1 + input.real_education_inflation, yrFromNow);
  }

  const projectedCapital =
    fvLumpSum(input.current_savings, input.real_return, yearsToStart) +
    fvAnnuity(input.current_monthly_contribution, input.real_return, yearsToStart);

  const shortfall = Math.max(0, lumpSum - projectedCapital);
  const reqMonthly =
    requiredContribution(shortfall, input.real_return, yearsToStart) +
    input.current_monthly_contribution;

  return {
    years_to_start: yearsToStart,
    total_cost_at_start_today_rands: round2(
      input.annual_cost_today * input.years_of_study,
    ),
    required_capital_at_start: round2(lumpSum),
    projected_capital_at_start: round2(projectedCapital),
    shortfall: round2(shortfall),
    required_monthly_contribution: round2(reqMonthly),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
