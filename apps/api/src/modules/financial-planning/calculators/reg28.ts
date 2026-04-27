import { REG28_LIMITS } from '../sa-tax-constants';

export interface AssetExposure {
  /** Sub-asset class label (advisor friendly). */
  class:
    | 'sa_equity'
    | 'sa_property'
    | 'sa_bonds'
    | 'sa_cash'
    | 'offshore_equity'
    | 'offshore_property'
    | 'offshore_bonds'
    | 'offshore_cash'
    | 'africa_ex_sa'
    | 'hedge'
    | 'private_equity'
    | 'other';
  weight_pct: number; // 0–1
}

export interface Reg28Output {
  total_equity_pct: number;
  total_property_pct: number;
  total_offshore_pct: number;
  africa_ex_sa_pct: number;
  hedge_pct: number;
  private_equity_pct: number;
  breaches: Array<{ rule: string; cap_pct: number; actual_pct: number }>;
  compliant: boolean;
}

/**
 * Regulation 28 prudential checker for retirement funds (RA / pension /
 * provident / preservation). Asset weights should sum to ~1.
 */
export function reg28Check(exposures: AssetExposure[]): Reg28Output {
  const sum = (filter: (e: AssetExposure) => boolean) =>
    exposures.filter(filter).reduce((s, e) => s + (e.weight_pct || 0), 0);

  const equity = sum((e) => e.class === 'sa_equity' || e.class === 'offshore_equity');
  const property = sum((e) => e.class === 'sa_property' || e.class === 'offshore_property');
  const offshore = sum((e) =>
    ['offshore_equity', 'offshore_property', 'offshore_bonds', 'offshore_cash', 'africa_ex_sa'].includes(
      e.class,
    ),
  );
  const africa = sum((e) => e.class === 'africa_ex_sa');
  const hedge = sum((e) => e.class === 'hedge');
  const pe = sum((e) => e.class === 'private_equity');

  const breaches: Reg28Output['breaches'] = [];
  if (equity > REG28_LIMITS.equity)
    breaches.push({ rule: 'Equity', cap_pct: REG28_LIMITS.equity, actual_pct: equity });
  if (property > REG28_LIMITS.property)
    breaches.push({ rule: 'Property', cap_pct: REG28_LIMITS.property, actual_pct: property });
  if (offshore > REG28_LIMITS.offshore)
    breaches.push({ rule: 'Offshore (incl Africa)', cap_pct: REG28_LIMITS.offshore, actual_pct: offshore });
  if (africa > REG28_LIMITS.africa_ex_sa)
    breaches.push({ rule: 'Africa ex-SA', cap_pct: REG28_LIMITS.africa_ex_sa, actual_pct: africa });
  if (hedge > REG28_LIMITS.hedge_funds)
    breaches.push({ rule: 'Hedge funds', cap_pct: REG28_LIMITS.hedge_funds, actual_pct: hedge });
  if (pe > REG28_LIMITS.private_equity)
    breaches.push({ rule: 'Private equity', cap_pct: REG28_LIMITS.private_equity, actual_pct: pe });

  return {
    total_equity_pct: round4(equity),
    total_property_pct: round4(property),
    total_offshore_pct: round4(offshore),
    africa_ex_sa_pct: round4(africa),
    hedge_pct: round4(hedge),
    private_equity_pct: round4(pe),
    breaches,
    compliant: breaches.length === 0,
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
