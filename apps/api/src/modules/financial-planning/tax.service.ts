import { Injectable } from '@nestjs/common';
import { SA_TAX, CGTCalculation, IncomeTaxCalculation, EstateDutyCalculation } from '@steward/shared';

// SARS income tax tables for 2025/2026 tax year
const SARS_TAX_BRACKETS_2026 = [
  { limit: 237_100,   base: 0,         rate: 0.18 },
  { limit: 370_500,   base: 42_678,    rate: 0.26 },
  { limit: 512_800,   base: 77_362,    rate: 0.31 },
  { limit: 673_000,   base: 121_475,   rate: 0.36 },
  { limit: 857_900,   base: 179_147,   rate: 0.39 },
  { limit: 1_817_000, base: 251_258,   rate: 0.41 },
  { limit: Infinity,  base: 644_489,   rate: 0.45 },
];
const PRIMARY_REBATE_2026 = 17_235;
const TAX_YEAR = '2025/2026';

@Injectable()
export class TaxService {
  calculateCGT(disposalGain: number): CGTCalculation {
    const annualExclusion = SA_TAX.CGT_ANNUAL_EXCLUSION_INDIVIDUAL;
    const inclusionRate = SA_TAX.CGT_INCLUSION_RATE_INDIVIDUAL;
    const netGain = Math.max(0, disposalGain - annualExclusion);
    const taxableGain = netGain * inclusionRate;

    // CGT liability = taxable gain × individual's marginal rate
    // We use a simplified 18% minimum for illustration; real calc needs full income
    const cgtLiability = taxableGain * 0.18;

    return {
      gross_gain: disposalGain,
      annual_exclusion: annualExclusion,
      inclusion_rate: inclusionRate,
      taxable_gain: taxableGain,
      cgt_liability: cgtLiability,
      tax_year: TAX_YEAR,
    };
  }

  calculateCGTWithMarginalRate(disposalGain: number, marginalRate: number): CGTCalculation {
    const annualExclusion = SA_TAX.CGT_ANNUAL_EXCLUSION_INDIVIDUAL;
    const inclusionRate = SA_TAX.CGT_INCLUSION_RATE_INDIVIDUAL;
    const netGain = Math.max(0, disposalGain - annualExclusion);
    const taxableGain = netGain * inclusionRate;
    const cgtLiability = taxableGain * marginalRate;

    return {
      gross_gain: disposalGain,
      annual_exclusion: annualExclusion,
      inclusion_rate: inclusionRate,
      taxable_gain: taxableGain,
      cgt_liability: cgtLiability,
      tax_year: TAX_YEAR,
    };
  }

  calculateIncomeTax(taxableIncome: number): IncomeTaxCalculation {
    let taxBeforeRebates = 0;
    let marginalRate = 0;

    for (const bracket of SARS_TAX_BRACKETS_2026) {
      if (taxableIncome <= bracket.limit) {
        const prevLimit = SARS_TAX_BRACKETS_2026[SARS_TAX_BRACKETS_2026.indexOf(bracket) - 1]?.limit ?? 0;
        taxBeforeRebates = bracket.base + (taxableIncome - prevLimit) * bracket.rate;
        marginalRate = bracket.rate;
        break;
      }
    }

    const netTax = Math.max(0, taxBeforeRebates - PRIMARY_REBATE_2026);
    const effectiveRate = taxableIncome > 0 ? netTax / taxableIncome : 0;

    return {
      taxable_income: taxableIncome,
      tax_before_rebates: taxBeforeRebates,
      primary_rebate: PRIMARY_REBATE_2026,
      net_tax: netTax,
      effective_rate: effectiveRate,
      marginal_rate: marginalRate,
      tax_year: TAX_YEAR,
    };
  }

  calculateEstateDuty(
    grossEstateValue: number,
    spouseRebate = 0,
  ): EstateDutyCalculation {
    const abatement = SA_TAX.ESTATE_ABATEMENT + spouseRebate;
    const dutiableEstate = Math.max(0, grossEstateValue - abatement);

    let duty = 0;
    if (dutiableEstate <= SA_TAX.ESTATE_DUTY_EXCESS_THRESHOLD) {
      duty = dutiableEstate * SA_TAX.ESTATE_DUTY_RATE_STANDARD;
    } else {
      duty =
        SA_TAX.ESTATE_DUTY_EXCESS_THRESHOLD * SA_TAX.ESTATE_DUTY_RATE_STANDARD +
        (dutiableEstate - SA_TAX.ESTATE_DUTY_EXCESS_THRESHOLD) * SA_TAX.ESTATE_DUTY_RATE_EXCESS;
    }

    const executorFees = grossEstateValue * SA_TAX.EXECUTOR_FEES_RATE;

    return {
      gross_estate: grossEstateValue,
      abatement,
      dutiable_estate: dutiableEstate,
      duty,
      executor_fees: executorFees,
      liquidity_required: duty + executorFees,
    };
  }

  calculateDividendWithholdingTax(dividends: number): number {
    return dividends * SA_TAX.DIVIDEND_WITHHOLDING_TAX;
  }
}
