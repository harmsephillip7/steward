import { livingAnnuityProjection } from './living-annuity';

describe('livingAnnuityProjection', () => {
  it('rejects draw outside 2.5–17.5%', () => {
    const a = livingAnnuityProjection({
      capital: 5_000_000,
      draw_pct: 0.02, // below min
      real_return: 0.04,
      years: 5,
    });
    expect(a.draw_pct_valid).toBe(false);

    const b = livingAnnuityProjection({
      capital: 5_000_000,
      draw_pct: 0.18, // above max
      real_return: 0.04,
      years: 5,
    });
    expect(b.draw_pct_valid).toBe(false);
  });

  it('5% draw, 4% real return — slow erosion', () => {
    const out = livingAnnuityProjection({
      capital: 5_000_000,
      draw_pct: 0.05,
      real_return: 0.04,
      years: 25,
    });
    expect(out.draw_pct_valid).toBe(true);
    expect(out.initial_annual_income).toBe(250_000);
    expect(out.schedule).toHaveLength(25);
    // Closing balance after 25 years should still be positive but less than starting
    const last = out.schedule[24];
    expect(last.closing_balance).toBeGreaterThan(0);
    expect(last.closing_balance).toBeLessThan(5_000_000);
  });

  it('17% draw, 4% return → fast erosion', () => {
    const out = livingAnnuityProjection({
      capital: 5_000_000,
      draw_pct: 0.17,
      real_return: 0.04,
      years: 30,
    });
    // capital should be very small or exhausted
    const last = out.schedule[29];
    expect(last.closing_balance).toBeLessThan(2_000_000);
  });
});
