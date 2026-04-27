import { PlanCode } from './entities/billing.entity';

export interface PlanSeed {
  code: PlanCode;
  name: string;
  description: string;
  price_per_seat_cents: number;
  platform_fee_cents: number;
  min_seats: number;
  client_cap_per_seat: number | null;
  ai_screen_soft_cap: number | null;
  esign_soft_cap: number | null;
  dedicated_database: boolean;
  white_label: boolean;
}

/** Canonical price list. Single source of truth — also rendered on /pricing. */
export const PLAN_CATALOGUE: PlanSeed[] = [
  {
    code: 'solo',
    name: 'Solo Advisor',
    description:
      'For independent advisors. Full platform on a shared, isolated database.',
    price_per_seat_cents: 149_900,
    platform_fee_cents: 0,
    min_seats: 1,
    client_cap_per_seat: 150,
    ai_screen_soft_cap: 1_000,
    esign_soft_cap: 50,
    dedicated_database: false,
    white_label: false,
  },
  {
    code: 'firm',
    name: 'Firm',
    description:
      'For firms with 2–25 advisors. Adds firm console, teams, RBAC, SSO, and 99.5% SLA.',
    price_per_seat_cents: 119_900,
    platform_fee_cents: 99_900,
    min_seats: 3,
    client_cap_per_seat: 250,
    ai_screen_soft_cap: 5_000,
    esign_soft_cap: 250,
    dedicated_database: false,
    white_label: false,
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    description:
      'White-label, dedicated PostgreSQL database, custom domain, SAML SSO, named CSM, 99.9% SLA.',
    price_per_seat_cents: 0, // negotiated; flat fee model
    platform_fee_cents: 3_500_000, // R35,000 baseline
    min_seats: 25,
    client_cap_per_seat: null,
    ai_screen_soft_cap: null,
    esign_soft_cap: null,
    dedicated_database: true,
    white_label: true,
  },
];

export const TRIAL_DAYS = 14;
