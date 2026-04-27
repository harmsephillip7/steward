import {
  fvLumpSum,
  fvAnnuity,
  pvAnnuity,
  requiredContribution,
  retirementGap,
  s11fCap,
  calcIncomeTax,
} from './retirement';

describe('retirement calculators', () => {
  describe('fvLumpSum', () => {
    it('compounds correctly', () => {
      expect(fvLumpSum(1000, 0.1, 10)).toBeCloseTo(2593.74, 2);
    });
    it('returns PV when n=0', () => {
      expect(fvLumpSum(500, 0.05, 0)).toBe(500);
    });
  });

  describe('fvAnnuity', () => {
    it('matches financial-calc spec for level monthly contribution', () => {
      // R1000/m for 12 months at 12% nominal — annual contribution R12k, FV ≈ 12,683
      const fv = fvAnnuity(1000, 0.12, 1);
      expect(fv).toBeGreaterThan(12_500);
      expect(fv).toBeLessThan(12_900);
    });
    it('returns 0 for non-positive years or contribution', () => {
      expect(fvAnnuity(0, 0.05, 5)).toBe(0);
      expect(fvAnnuity(100, 0.05, 0)).toBe(0);
    });
    it('handles equal r and g without dividing by zero', () => {
      const fv = fvAnnuity(100, 0.06, 5, 0.06);
      expect(fv).toBeGreaterThan(0);
      expect(Number.isFinite(fv)).toBe(true);
    });
  });

  describe('pvAnnuity', () => {
    it('values 25 years of R20k/m at 4% real ≈ R3.79m', () => {
      const pv = pvAnnuity(20_000, 0.04, 25);
      expect(pv).toBeGreaterThan(3_700_000);
      expect(pv).toBeLessThan(3_900_000);
    });
    it('handles 0% real return as simple multiplier', () => {
      expect(pvAnnuity(1000, 0, 10)).toBeCloseTo(120_000, 0);
    });
  });

  describe('requiredContribution', () => {
    it('zero shortfall → zero contribution', () => {
      expect(requiredContribution(0, 0.05, 10)).toBe(0);
    });
    it('positive shortfall → positive contribution', () => {
      const pmt = requiredContribution(1_000_000, 0.06, 20);
      expect(pmt).toBeGreaterThan(0);
      expect(pmt).toBeLessThan(5_000); // sanity check
    });
  });

  describe('s11fCap', () => {
    it('caps at 27.5% of taxable income', () => {
      expect(s11fCap(500_000)).toBeCloseTo(137_500, 2);
    });
    it('caps at R350k absolute', () => {
      expect(s11fCap(2_000_000)).toBe(350_000);
    });
  });

  describe('calcIncomeTax (2026)', () => {
    it('taxes a R500k income correctly with primary rebate', () => {
      // Bracket: R370,500–R512,800 — base R77,362 + 31% above R370,500
      // Tax = 77362 + (500000-370500)*0.31 = 77362 + 40145 = 117507
      // Less primary rebate R17,235 = R100,272
      expect(calcIncomeTax(500_000, 30)).toBeCloseTo(100_272, 0);
    });
    it('applies secondary rebate at 65+', () => {
      const t30 = calcIncomeTax(500_000, 30);
      const t65 = calcIncomeTax(500_000, 65);
      expect(t30 - t65).toBeCloseTo(9_444, 0);
    });
    it('returns 0 for incomes below threshold', () => {
      expect(calcIncomeTax(50_000, 30)).toBe(0);
    });
  });

  describe('retirementGap', () => {
    it('flags shortfall when contributions are too small', () => {
      const out = retirementGap({
        current_age: 35,
        retirement_age: 65,
        life_expectancy: 90,
        current_capital: 200_000,
        current_monthly_contribution: 2000,
        required_monthly_income_today: 30_000,
        real_return_pre: 0.05,
        real_return_post: 0.04,
      });
      expect(out.years_to_retirement).toBe(30);
      expect(out.years_in_retirement).toBe(25);
      expect(out.shortfall).toBeGreaterThan(0);
      expect(out.required_monthly_contribution).toBeGreaterThan(2000);
      expect(out.income_replacement_ratio).toBeLessThan(1);
    });

    it('zero shortfall when projected ≥ required', () => {
      const out = retirementGap({
        current_age: 35,
        retirement_age: 65,
        life_expectancy: 90,
        current_capital: 50_000_000, // huge starting capital
        current_monthly_contribution: 0,
        required_monthly_income_today: 30_000,
        real_return_pre: 0.05,
        real_return_post: 0.04,
      });
      expect(out.shortfall).toBe(0);
      expect(out.income_replacement_ratio).toBe(1);
    });

    it('reports s11F room when taxable_income provided', () => {
      const out = retirementGap({
        current_age: 35,
        retirement_age: 65,
        life_expectancy: 90,
        current_capital: 0,
        current_monthly_contribution: 1000, // R12k pa
        required_monthly_income_today: 10_000,
        real_return_pre: 0.05,
        real_return_post: 0.04,
        taxable_income: 600_000,
      });
      expect(out.s11f_max_deduction).toBeCloseTo(165_000, 0);
      expect(out.s11f_remaining_room).toBeCloseTo(153_000, 0); // 165k - 12k
    });
  });
});
