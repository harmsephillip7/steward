import { lifeCoverNeed, disabilityNeed, dreadDiseaseNeed } from './insurance';

describe('insurance calculators', () => {
  describe('lifeCoverNeed', () => {
    it('capitalises income need + adds liabilities + final + education', () => {
      const out = lifeCoverNeed({
        required_monthly_income: 25_000,
        replacement_years: 20,
        real_return: 0.04,
        liabilities: 800_000,
        final_expenses: 100_000,
        education_fund_needed: 1_500_000,
        existing_cover: 1_000_000,
        liquid_assets: 200_000,
      });
      expect(out.income_replacement_capital).toBeGreaterThan(4_000_000);
      expect(out.income_replacement_capital).toBeLessThan(4_200_000);
      expect(out.total_required).toBe(
        out.income_replacement_capital + 800_000 + 100_000 + 1_500_000,
      );
      expect(out.total_available).toBe(1_200_000);
      expect(out.shortfall).toBe(out.total_required - 1_200_000);
    });

    it('zero shortfall when assets exceed need', () => {
      const out = lifeCoverNeed({
        required_monthly_income: 1_000,
        replacement_years: 1,
        real_return: 0.04,
        liabilities: 0,
        final_expenses: 0,
        education_fund_needed: 0,
        existing_cover: 100_000_000,
        liquid_assets: 0,
      });
      expect(out.shortfall).toBe(0);
    });
  });

  describe('disabilityNeed', () => {
    it('flags shortfall when existing capital insufficient', () => {
      const out = disabilityNeed({
        required_monthly_income: 30_000,
        current_age: 40,
        retirement_age: 65,
        real_return: 0.04,
        existing_disability_capital: 1_000_000,
      });
      expect(out.years_to_retirement).toBe(25);
      expect(out.shortfall).toBeGreaterThan(0);
    });
    it('PHI offset reduces shortfall', () => {
      const without = disabilityNeed({
        required_monthly_income: 30_000,
        current_age: 40,
        retirement_age: 65,
        real_return: 0.04,
        existing_disability_capital: 0,
      });
      const withPhi = disabilityNeed({
        required_monthly_income: 30_000,
        current_age: 40,
        retirement_age: 65,
        real_return: 0.04,
        existing_disability_capital: 0,
        existing_phi_monthly: 10_000,
      });
      expect(withPhi.shortfall).toBeLessThan(without.shortfall);
    });
  });

  describe('dreadDiseaseNeed', () => {
    it('1× annual income recommendation', () => {
      const out = dreadDiseaseNeed({
        recommended_multiplier_of_income: 1,
        annual_income: 600_000,
        existing_cover: 200_000,
      });
      expect(out.recommended).toBe(600_000);
      expect(out.shortfall).toBe(400_000);
    });
  });
});
