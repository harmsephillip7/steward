import { reg28Check } from './reg28';

describe('reg28Check', () => {
  it('compliant balanced fund', () => {
    const out = reg28Check([
      { class: 'sa_equity', weight_pct: 0.35 },
      { class: 'offshore_equity', weight_pct: 0.20 },
      { class: 'sa_bonds', weight_pct: 0.20 },
      { class: 'offshore_bonds', weight_pct: 0.10 },
      { class: 'sa_property', weight_pct: 0.05 },
      { class: 'sa_cash', weight_pct: 0.10 },
    ]);
    expect(out.compliant).toBe(true);
    expect(out.breaches).toHaveLength(0);
    expect(out.total_equity_pct).toBeCloseTo(0.55, 4);
    expect(out.total_offshore_pct).toBeCloseTo(0.30, 4);
  });

  it('flags equity > 75%', () => {
    const out = reg28Check([
      { class: 'sa_equity', weight_pct: 0.50 },
      { class: 'offshore_equity', weight_pct: 0.30 },
      { class: 'sa_cash', weight_pct: 0.20 },
    ]);
    expect(out.compliant).toBe(false);
    expect(out.breaches.find((b) => b.rule === 'Equity')).toBeDefined();
  });

  it('flags offshore > 45%', () => {
    const out = reg28Check([
      { class: 'sa_equity', weight_pct: 0.30 },
      { class: 'offshore_equity', weight_pct: 0.40 },
      { class: 'offshore_bonds', weight_pct: 0.10 },
      { class: 'sa_cash', weight_pct: 0.20 },
    ]);
    expect(out.compliant).toBe(false);
    expect(out.breaches.find((b) => b.rule.includes('Offshore'))).toBeDefined();
  });
});
