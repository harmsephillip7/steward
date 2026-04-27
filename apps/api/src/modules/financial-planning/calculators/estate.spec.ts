import { estateLiquidity } from './estate';

describe('estateLiquidity', () => {
  it('R10m estate, no spouse — duty 20% of (10m - 3.5m)', () => {
    const out = estateLiquidity({
      gross_estate: 10_000_000,
      spouse_bequest: 0,
      pbo_bequest: 0,
      approved_retirement_benefits: 0,
      life_policy_proceeds_estate: 0,
      liabilities: 0,
      administration_costs: 0,
      cgt_gain_on_death: 0,
      marginal_tax_rate: 0.45,
      liquid_assets: 0,
    });
    expect(out.dutiable_estate).toBe(6_500_000);
    expect(out.estate_duty).toBeCloseTo(1_300_000, 0);
  });

  it('R50m estate uses tiered duty', () => {
    const out = estateLiquidity({
      gross_estate: 50_000_000,
      spouse_bequest: 0,
      pbo_bequest: 0,
      approved_retirement_benefits: 0,
      life_policy_proceeds_estate: 0,
      liabilities: 0,
      administration_costs: 0,
      cgt_gain_on_death: 0,
      marginal_tax_rate: 0.45,
      liquid_assets: 0,
    });
    // dutiable = 46.5m
    // first 30m × 20% = 6m
    // next 16.5m × 25% = 4.125m
    // total ≈ 10.125m
    expect(out.dutiable_estate).toBe(46_500_000);
    expect(out.estate_duty).toBeCloseTo(10_125_000, 0);
  });

  it('spouse bequest eliminates duty', () => {
    const out = estateLiquidity({
      gross_estate: 10_000_000,
      spouse_bequest: 10_000_000,
      pbo_bequest: 0,
      approved_retirement_benefits: 0,
      life_policy_proceeds_estate: 0,
      liabilities: 0,
      administration_costs: 0,
      cgt_gain_on_death: 0,
      marginal_tax_rate: 0.45,
      liquid_assets: 0,
    });
    expect(out.estate_duty).toBe(0);
    expect(out.cgt_payable_on_death).toBe(0);
  });

  it('CGT excludes first R300k and applies 40% inclusion', () => {
    const out = estateLiquidity({
      gross_estate: 1_000_000,
      spouse_bequest: 0,
      pbo_bequest: 0,
      approved_retirement_benefits: 0,
      life_policy_proceeds_estate: 0,
      liabilities: 0,
      administration_costs: 0,
      cgt_gain_on_death: 800_000,
      marginal_tax_rate: 0.45,
      liquid_assets: 0,
    });
    // Taxable gain = 800k - 300k = 500k. 500k * 40% * 45% = 90k
    expect(out.cgt_payable_on_death).toBeCloseTo(90_000, 0);
  });

  it('liquidity_shortfall = total_costs - liquid_assets', () => {
    const out = estateLiquidity({
      gross_estate: 5_000_000,
      spouse_bequest: 0,
      pbo_bequest: 0,
      approved_retirement_benefits: 0,
      life_policy_proceeds_estate: 0,
      liabilities: 200_000,
      administration_costs: 50_000,
      cgt_gain_on_death: 0,
      marginal_tax_rate: 0.45,
      liquid_assets: 100_000,
    });
    expect(out.liquidity_shortfall).toBeGreaterThan(0);
    expect(out.liquidity_shortfall).toBe(out.total_costs_at_death - 100_000);
  });
});
