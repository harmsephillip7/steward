import { educationGoal } from './education';

describe('educationGoal', () => {
  it('newborn → 18 yrs to start, escalates fees', () => {
    const out = educationGoal({
      child_current_age: 0,
      start_age: 18,
      years_of_study: 4,
      annual_cost_today: 80_000,
      real_education_inflation: 0.03,
      real_return: 0.05,
      current_savings: 0,
      current_monthly_contribution: 0,
    });
    expect(out.years_to_start).toBe(18);
    // 4 years of escalated fees should beat the nominal R320k
    expect(out.required_capital_at_start).toBeGreaterThan(320_000);
    expect(out.shortfall).toBeGreaterThan(0);
    expect(out.required_monthly_contribution).toBeGreaterThan(0);
  });

  it('zero shortfall when savings are sufficient', () => {
    const out = educationGoal({
      child_current_age: 17,
      start_age: 18,
      years_of_study: 4,
      annual_cost_today: 80_000,
      real_education_inflation: 0,
      real_return: 0,
      current_savings: 1_000_000,
      current_monthly_contribution: 0,
    });
    expect(out.shortfall).toBe(0);
  });
});
