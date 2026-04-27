import {
  ESTATE_DUTY_ABATEMENT,
  ESTATE_DUTY_RATE_FIRST,
  ESTATE_DUTY_RATE_ABOVE,
  ESTATE_DUTY_THRESHOLD,
  EXECUTOR_FEE_RATE,
  VAT_RATE,
  CGT_DEATH_EXCLUSION,
  CGT_INCLUSION_INDIVIDUAL,
} from '../sa-tax-constants';

export interface EstateInput {
  gross_estate: number;
  /** Bequests to surviving spouse (s4(q) deduction). */
  spouse_bequest: number;
  /** Bequests to qualifying PBOs (s4(h)). */
  pbo_bequest: number;
  /** Approved retirement fund death benefits — exempt for estate duty. */
  approved_retirement_benefits: number;
  /** Domestic life-policy proceeds owed to non-spouse — included unless s3(3)(a) carve-out. */
  life_policy_proceeds_estate: number;
  /** Liabilities at death. */
  liabilities: number;
  /** Funeral, master's fee, advertising. */
  administration_costs: number;
  /** Embedded gain on disposal at death (after R300k abatement, before inclusion). */
  cgt_gain_on_death: number;
  /** Marginal income tax rate for CGT effective rate (e.g. 0.45). */
  marginal_tax_rate: number;
  /** Liquid assets available to settle costs. */
  liquid_assets: number;
}

export interface EstateOutput {
  net_estate: number;
  dutiable_estate: number;
  estate_duty: number;
  cgt_payable_on_death: number;
  executor_fee_excl_vat: number;
  executor_fee_incl_vat: number;
  total_costs_at_death: number;
  liquidity_shortfall: number;
}

export function estateLiquidity(input: EstateInput): EstateOutput {
  const grossDeductions =
    (input.spouse_bequest || 0) +
    (input.pbo_bequest || 0) +
    (input.approved_retirement_benefits || 0) +
    (input.liabilities || 0) +
    (input.administration_costs || 0);

  const netEstate = Math.max(
    0,
    input.gross_estate + (input.life_policy_proceeds_estate || 0) - grossDeductions,
  );
  const dutiable = Math.max(0, netEstate - ESTATE_DUTY_ABATEMENT);

  let duty = 0;
  if (dutiable <= ESTATE_DUTY_THRESHOLD) {
    duty = dutiable * ESTATE_DUTY_RATE_FIRST;
  } else {
    duty =
      ESTATE_DUTY_THRESHOLD * ESTATE_DUTY_RATE_FIRST +
      (dutiable - ESTATE_DUTY_THRESHOLD) * ESTATE_DUTY_RATE_ABOVE;
  }

  // CGT at death — R300k extra abatement, individual 40% inclusion
  const taxableGain = Math.max(0, (input.cgt_gain_on_death || 0) - CGT_DEATH_EXCLUSION);
  const cgt = taxableGain * CGT_INCLUSION_INDIVIDUAL * input.marginal_tax_rate;

  const execFee = input.gross_estate * EXECUTOR_FEE_RATE;
  const execFeeVat = execFee * (1 + VAT_RATE);

  const totalCosts =
    duty + cgt + execFeeVat + (input.administration_costs || 0) + (input.liabilities || 0);
  const shortfall = Math.max(0, totalCosts - (input.liquid_assets || 0));

  return {
    net_estate: round2(netEstate),
    dutiable_estate: round2(dutiable),
    estate_duty: round2(duty),
    cgt_payable_on_death: round2(cgt),
    executor_fee_excl_vat: round2(execFee),
    executor_fee_incl_vat: round2(execFeeVat),
    total_costs_at_death: round2(totalCosts),
    liquidity_shortfall: round2(shortfall),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
