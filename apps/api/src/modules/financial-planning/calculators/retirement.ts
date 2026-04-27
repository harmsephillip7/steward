import {
  INCOME_TAX_BRACKETS,
  PRIMARY_REBATE,
  SECONDARY_REBATE,
  TERTIARY_REBATE,
  S11F_PERCENTAGE_CAP,
  S11F_RAND_CAP,
} from '../sa-tax-constants';

export interface RetirementInput {
  current_age: number;
  retirement_age: number;
  life_expectancy: number;
  current_capital: number;
  current_monthly_contribution: number;
  required_monthly_income_today: number;
  /** Real (after-inflation) net return assumed during accumulation, e.g. 0.05 for 5%. */
  real_return_pre: number;
  /** Real return during drawdown. */
  real_return_post: number;
  /** Annual employer + employee contribution increase (real). */
  contribution_growth_real?: number;
  /** Optional taxable income for s11F context. */
  taxable_income?: number;
}

export interface RetirementOutput {
  years_to_retirement: number;
  years_in_retirement: number;
  required_capital_at_retirement: number;
  projected_capital_at_retirement: number;
  shortfall: number;
  required_monthly_contribution: number;
  income_replacement_ratio: number;
  s11f_max_deduction: number;
  s11f_remaining_room: number;
}

/**
 * Future value of a lump sum.
 *  FV = PV * (1 + r)^n
 */
export function fvLumpSum(pv: number, r: number, n: number): number {
  return pv * Math.pow(1 + r, n);
}

/**
 * Future value of a growing annuity (contributions paid monthly, indexed annually).
 *  Approximated with an effective monthly rate.
 */
export function fvAnnuity(monthly: number, annualRate: number, years: number, growth = 0): number {
  if (years <= 0 || monthly <= 0) return 0;
  const months = years * 12;
  const r = annualRate / 12;
  const g = growth / 12;
  if (Math.abs(r - g) < 1e-9) {
    // r == g case: FV = pmt * months * (1+r)^(months-1)
    return monthly * months * Math.pow(1 + r, months - 1);
  }
  return monthly * ((Math.pow(1 + r, months) - Math.pow(1 + g, months)) / (r - g));
}

/**
 * Present value of an income stream of `monthly` paid for `years` years,
 * discounted at `annualRate` real return.
 *  PV = pmt * (1 - (1+r)^-n) / r
 */
export function pvAnnuity(monthly: number, annualRate: number, years: number): number {
  if (years <= 0) return 0;
  const months = years * 12;
  const r = annualRate / 12;
  if (Math.abs(r) < 1e-9) return monthly * months;
  return monthly * ((1 - Math.pow(1 + r, -months)) / r);
}

/**
 * Required monthly contribution to fill a future shortfall.
 * Solves: shortfall = pmt * ((1+r)^n - 1) / r
 */
export function requiredContribution(shortfall: number, annualRate: number, years: number): number {
  if (shortfall <= 0 || years <= 0) return 0;
  const months = years * 12;
  const r = annualRate / 12;
  if (Math.abs(r) < 1e-9) return shortfall / months;
  return (shortfall * r) / (Math.pow(1 + r, months) - 1);
}

/** Section 11F annual deduction cap (lesser of 27.5% × taxable income, R350k). */
export function s11fCap(taxableIncome: number): number {
  return Math.min(taxableIncome * S11F_PERCENTAGE_CAP, S11F_RAND_CAP);
}

/** Calculate income tax owed (individual, before rebates). */
export function calcIncomeTax(taxableIncome: number, age = 30): number {
  let tax = 0;
  let lower = 0;
  for (const b of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= b.upTo) {
      tax = b.base + (taxableIncome - lower) * b.rate;
      break;
    }
    lower = b.upTo;
  }
  let rebate = PRIMARY_REBATE;
  if (age >= 65) rebate += SECONDARY_REBATE;
  if (age >= 75) rebate += TERTIARY_REBATE;
  return Math.max(0, tax - rebate);
}

/**
 * Retirement gap calculation.
 * All monetary values are in TODAY's rands; we use real returns so
 * inflation is implicitly handled.
 */
export function retirementGap(input: RetirementInput): RetirementOutput {
  const yearsToRet = Math.max(0, input.retirement_age - input.current_age);
  const yearsInRet = Math.max(0, input.life_expectancy - input.retirement_age);

  const requiredCapital = pvAnnuity(
    input.required_monthly_income_today,
    input.real_return_post,
    yearsInRet,
  );

  const fvCurrent = fvLumpSum(input.current_capital, input.real_return_pre, yearsToRet);
  const fvContribs = fvAnnuity(
    input.current_monthly_contribution,
    input.real_return_pre,
    yearsToRet,
    input.contribution_growth_real ?? 0,
  );
  const projectedCapital = fvCurrent + fvContribs;

  const shortfall = Math.max(0, requiredCapital - projectedCapital);
  const reqMonthly =
    requiredContribution(shortfall, input.real_return_pre, yearsToRet) +
    input.current_monthly_contribution;

  const replacementRatio =
    requiredCapital > 0 ? Math.min(1, projectedCapital / requiredCapital) : 1;

  const s11fMax = input.taxable_income !== undefined ? s11fCap(input.taxable_income) : 0;
  const annualContribution = input.current_monthly_contribution * 12;
  const s11fRoom = Math.max(0, s11fMax - annualContribution);

  return {
    years_to_retirement: yearsToRet,
    years_in_retirement: yearsInRet,
    required_capital_at_retirement: round2(requiredCapital),
    projected_capital_at_retirement: round2(projectedCapital),
    shortfall: round2(shortfall),
    required_monthly_contribution: round2(reqMonthly),
    income_replacement_ratio: round4(replacementRatio),
    s11f_max_deduction: round2(s11fMax),
    s11f_remaining_room: round2(s11fRoom),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
