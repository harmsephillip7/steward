import { compareReplacement } from './replacement-comparison.service';

describe('compareReplacement (FAIS s8(1)(d))', () => {
  it('proposed cheaper than existing → positive net benefit, no upfront cost', () => {
    const out = compareReplacement({
      existing: {
        product_name: 'Old RA',
        product_provider: 'Provider A',
        current_value: 500_000,
        ongoing_fees_pct: 0.025,
      },
      proposed: {
        product_name: 'New RA',
        product_provider: 'Provider B',
        ongoing_fees_pct: 0.012,
      },
      horizon_years: 10,
      real_return: 0.04,
    });
    expect(out.fee_diff_pct_pa).toBeCloseTo(-0.013, 4);
    expect(out.estimated_annual_fee_saving).toBeGreaterThan(6_000);
    expect(out.net_benefit_over_horizon).toBeGreaterThan(0);
    expect(out.warnings).toHaveLength(0);
    expect(out.break_even_years).toBeNull();
  });

  it('surrender penalty + loyalty loss eroding benefit', () => {
    const out = compareReplacement({
      existing: {
        product_name: 'Old endowment',
        product_provider: 'Provider A',
        current_value: 500_000,
        surrender_value: 450_000,
        loyalty_bonuses_lost: 30_000,
        ongoing_fees_pct: 0.018,
      },
      proposed: {
        product_name: 'New unit trust',
        product_provider: 'Provider B',
        ongoing_fees_pct: 0.012,
        initial_fees_pct: 0.01,
      },
      horizon_years: 10,
      real_return: 0.04,
    });
    expect(out.warnings.some((w) => w.toLowerCase().includes('loyalty'))).toBe(true);
    expect(out.warnings.some((w) => w.toLowerCase().includes('surrender'))).toBe(true);
    expect(out.break_even_years).not.toBeNull();
  });

  it('proposed more expensive → flag warning + likely negative net benefit', () => {
    const out = compareReplacement({
      existing: {
        product_name: 'Old RA',
        product_provider: 'Provider A',
        current_value: 500_000,
        ongoing_fees_pct: 0.010,
      },
      proposed: {
        product_name: 'New RA',
        product_provider: 'Provider B',
        ongoing_fees_pct: 0.020,
      },
      horizon_years: 10,
      real_return: 0.04,
    });
    expect(out.fee_diff_pct_pa).toBeCloseTo(0.010, 4);
    expect(out.warnings.some((w) => w.includes('more expensive'))).toBe(true);
    expect(out.net_benefit_over_horizon).toBeLessThan(0);
  });

  it('flags loss of guarantees', () => {
    const out = compareReplacement({
      existing: {
        product_name: 'Endowment',
        product_provider: 'A',
        current_value: 100_000,
        ongoing_fees_pct: 0.012,
        guarantees: 'Capital guarantee',
      },
      proposed: {
        product_name: 'Living annuity',
        product_provider: 'B',
        ongoing_fees_pct: 0.010,
      },
    });
    expect(out.warnings.some((w) => w.toLowerCase().includes('guarantee'))).toBe(true);
  });
});
