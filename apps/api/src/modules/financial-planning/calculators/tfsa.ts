import {
  TFSA_ANNUAL_LIMIT,
  TFSA_LIFETIME_LIMIT,
  TFSA_OVER_LIMIT_PENALTY,
} from '../sa-tax-constants';

export interface TfsaCheckInput {
  contributions_this_tax_year: number;
  contributions_lifetime: number;
  proposed_additional_contribution?: number;
}

export interface TfsaCheckOutput {
  remaining_annual: number;
  remaining_lifetime: number;
  over_contribution_annual: number;
  over_contribution_lifetime: number;
  penalty_estimate: number;
  warning?: string;
}

export function tfsaRoomCheck(input: TfsaCheckInput): TfsaCheckOutput {
  const proposed = input.proposed_additional_contribution ?? 0;
  const annualUsed = input.contributions_this_tax_year + proposed;
  const lifetimeUsed = input.contributions_lifetime + proposed;

  const remainingAnnual = Math.max(0, TFSA_ANNUAL_LIMIT - annualUsed);
  const remainingLifetime = Math.max(0, TFSA_LIFETIME_LIMIT - lifetimeUsed);

  const overAnnual = Math.max(0, annualUsed - TFSA_ANNUAL_LIMIT);
  const overLifetime = Math.max(0, lifetimeUsed - TFSA_LIFETIME_LIMIT);
  const overTotal = Math.max(overAnnual, overLifetime); // SARS uses worst-case
  const penalty = overTotal * TFSA_OVER_LIMIT_PENALTY;

  let warning: string | undefined;
  if (overAnnual > 0)
    warning = `Annual TFSA cap (R${TFSA_ANNUAL_LIMIT.toLocaleString('en-ZA')}) would be exceeded by R${overAnnual.toLocaleString('en-ZA')}; SARS penalty 40%.`;
  if (overLifetime > 0)
    warning = `Lifetime TFSA cap (R${TFSA_LIFETIME_LIMIT.toLocaleString('en-ZA')}) would be exceeded by R${overLifetime.toLocaleString('en-ZA')}; SARS penalty 40%.`;

  return {
    remaining_annual: round2(remainingAnnual),
    remaining_lifetime: round2(remainingLifetime),
    over_contribution_annual: round2(overAnnual),
    over_contribution_lifetime: round2(overLifetime),
    penalty_estimate: round2(penalty),
    warning,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
