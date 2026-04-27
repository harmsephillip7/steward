import { ReplacementCompareSide } from '../reports/templates/replacement.template';

export interface ReplacementCompareInput {
  existing: ReplacementCompareSide;
  proposed: ReplacementCompareSide;
  /** Years over which to assess net benefit (default 10). */
  horizon_years?: number;
  /** Real net return assumption used to capitalise differences (default 0.04). */
  real_return?: number;
}

export interface ReplacementCompareOutput {
  fee_diff_pct_pa: number; // proposed.ongoing - existing.ongoing
  estimated_annual_fee_saving: number; // -ve = client pays more
  break_even_years: number | null; // years for fee saving to recover loyalty + initial costs
  net_benefit_over_horizon: number; // capitalised over horizon_years
  cost_savings_or_loss: number; // alias of net_benefit_over_horizon for template
  warnings: string[];
  net_benefit_assessment: string;
}

/**
 * FAIS Section 8(1)(d) (General Code of Conduct) requires that, when advising
 * a replacement, the FSP discloses every material consequence and quantifies
 * the cost / benefit. This pure-function service provides that quantification.
 *
 * Conventions:
 *   - All currency values in ZAR.
 *   - Percentages are decimal (0.015 = 1.5%).
 *   - "ongoing_fees_pct" is interpreted as % p.a. of current_value.
 *   - "initial_fees_pct" is interpreted as % of the *proposed* product (one-off cost).
 *   - "loyalty_bonuses_lost" + surrender penalties from existing reduce starting capital.
 */
export function compareReplacement(input: ReplacementCompareInput): ReplacementCompareOutput {
  const horizon = input.horizon_years ?? 10;
  const r = input.real_return ?? 0.04;
  const existing = input.existing;
  const proposed = input.proposed;
  const warnings: string[] = [];

  const baseValue = existing.current_value ?? 0;
  const surrender = existing.surrender_value ?? baseValue;
  const surrenderLoss = Math.max(0, baseValue - surrender); // value lost to penalties / MVA
  const loyalty = existing.loyalty_bonuses_lost ?? 0;
  const upfrontCost =
    surrenderLoss + loyalty + (proposed.initial_fees_pct ?? 0) * baseValue;

  const feeDiffPct = (proposed.ongoing_fees_pct ?? 0) - (existing.ongoing_fees_pct ?? 0);
  const annualFeeSaving = -feeDiffPct * baseValue; // positive when proposed is cheaper

  // Break-even: years for cumulative fee saving to recover upfront cost.
  // Use simple compounding of the saving (treat as growing at real_return).
  let breakEven: number | null = null;
  if (annualFeeSaving > 0 && upfrontCost > 0) {
    // closed form for FV of annuity = upfrontCost
    // n = ln(1 + upfrontCost*r/annualFeeSaving) / ln(1+r)  if r > 0
    if (r > 0) {
      breakEven = Math.log(1 + (upfrontCost * r) / annualFeeSaving) / Math.log(1 + r);
    } else {
      breakEven = upfrontCost / annualFeeSaving;
    }
  }

  // Net benefit over horizon = future value of fee saving annuity − upfront cost compounded
  const fvSaving =
    r === 0
      ? annualFeeSaving * horizon
      : annualFeeSaving * ((Math.pow(1 + r, horizon) - 1) / r);
  const fvUpfront = upfrontCost * Math.pow(1 + r, horizon);
  const netBenefit = fvSaving - fvUpfront;

  if (loyalty > 0) warnings.push(`Loyalty bonuses worth R${loyalty.toLocaleString('en-ZA')} are forfeited.`);
  if (surrenderLoss > 0)
    warnings.push(
      `Surrender penalty / MVA: R${surrenderLoss.toLocaleString('en-ZA')} value lost on exit.`,
    );
  if (feeDiffPct > 0)
    warnings.push(
      `Proposed product is more expensive: ongoing fees +${(feeDiffPct * 100).toFixed(2)}% p.a.`,
    );
  if (existing.guarantees && !proposed.guarantees) {
    warnings.push('Existing product carries guarantees that the proposed product does not.');
  }
  if (
    existing.estimated_maturity != null &&
    proposed.estimated_maturity != null &&
    proposed.estimated_maturity < existing.estimated_maturity
  ) {
    warnings.push('Proposed projected maturity is lower than the existing product.');
  }

  let assessment: string;
  if (netBenefit > 0 && warnings.length === 0) {
    assessment = `Replacement materially benefits the client by ~R${round(netBenefit).toLocaleString('en-ZA')} over ${horizon} years and incurs no offsetting consequences.`;
  } else if (netBenefit > 0) {
    assessment = `Replacement appears net positive (~R${round(netBenefit).toLocaleString('en-ZA')} over ${horizon} years) but the consequences below must be disclosed and accepted by the client.`;
  } else if (netBenefit < 0) {
    assessment = `Replacement is net negative (~R${round(Math.abs(netBenefit)).toLocaleString('en-ZA')} cost over ${horizon} years). It should only proceed if non-financial benefits (suitability, service, transparency) clearly outweigh this cost, with full client consent.`;
  } else {
    assessment = 'Replacement is approximately cost-neutral over the horizon assessed.';
  }

  return {
    fee_diff_pct_pa: round4(feeDiffPct),
    estimated_annual_fee_saving: round(annualFeeSaving),
    break_even_years: breakEven == null ? null : round2(breakEven),
    net_benefit_over_horizon: round(netBenefit),
    cost_savings_or_loss: round(netBenefit),
    warnings,
    net_benefit_assessment: assessment,
  };
}

function round(n: number) { return Math.round(n); }
function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }
