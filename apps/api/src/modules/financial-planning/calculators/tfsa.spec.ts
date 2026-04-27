import { tfsaRoomCheck } from './tfsa';

describe('tfsaRoomCheck', () => {
  it('reports remaining room for under-cap user', () => {
    const out = tfsaRoomCheck({
      contributions_this_tax_year: 12_000,
      contributions_lifetime: 50_000,
    });
    expect(out.remaining_annual).toBe(24_000);
    expect(out.remaining_lifetime).toBe(450_000);
    expect(out.over_contribution_annual).toBe(0);
  });

  it('flags annual over-contribution and 40% penalty', () => {
    const out = tfsaRoomCheck({
      contributions_this_tax_year: 30_000,
      contributions_lifetime: 100_000,
      proposed_additional_contribution: 10_000,
    });
    expect(out.over_contribution_annual).toBe(4_000);
    expect(out.penalty_estimate).toBeCloseTo(1_600, 2);
    expect(out.warning).toBeDefined();
  });

  it('flags lifetime over-contribution', () => {
    const out = tfsaRoomCheck({
      contributions_this_tax_year: 30_000,
      contributions_lifetime: 495_000,
      proposed_additional_contribution: 6_000,
    });
    expect(out.over_contribution_lifetime).toBe(1_000);
    expect(out.warning).toMatch(/lifetime/i);
  });
});
