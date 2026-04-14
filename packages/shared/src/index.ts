// ─── Enums ───────────────────────────────────────────────────────────────────

export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  MODERATE_CONSERVATIVE = 'moderate_conservative',
  MODERATE = 'moderate',
  MODERATE_AGGRESSIVE = 'moderate_aggressive',
  AGGRESSIVE = 'aggressive',
}

export enum ScreeningMode {
  STRICT = 'strict',
  WEIGHTED = 'weighted',
}

export enum CompromiseCategory {
  ALCOHOL = 'alcohol',
  TOBACCO = 'tobacco',
  GAMBLING = 'gambling',
  ABORTION = 'abortion',
  WEAPONS = 'weapons',
  PORNOGRAPHY = 'pornography',
  CANNABIS = 'cannabis',
}

export enum FlagSource {
  MANUAL = 'manual',
  AI = 'ai',
}

export enum ComplianceStatus {
  COMPLETE = 'complete',
  INCOMPLETE = 'incomplete',
  PENDING = 'pending',
}

export enum AssetClass {
  EQUITY = 'equity',
  BOND = 'bond',
  PROPERTY = 'property',
  CASH = 'cash',
  MULTI_ASSET = 'multi_asset',
  COMMODITY = 'commodity',
  ALTERNATIVE = 'alternative',
}

export enum Region {
  SA = 'SA',
  GLOBAL = 'global',
  AFRICA = 'africa',
  US = 'us',
  EUROPE = 'europe',
  ASIA = 'asia',
}

export enum IngestionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

export enum TaxResidency {
  SA_RESIDENT = 'sa_resident',
  NON_RESIDENT = 'non_resident',
}

export enum BehaviourBias {
  LOSS_AVERSION = 'loss_aversion',
  HERDING = 'herding',
  RECENCY_BIAS = 'recency_bias',
  OVERCONFIDENCE = 'overconfidence',
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const COMPROMISE_CATEGORIES = Object.values(CompromiseCategory);

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  [RiskProfile.CONSERVATIVE]: 'Conservative',
  [RiskProfile.MODERATE_CONSERVATIVE]: 'Moderate Conservative',
  [RiskProfile.MODERATE]: 'Moderate',
  [RiskProfile.MODERATE_AGGRESSIVE]: 'Moderate Aggressive',
  [RiskProfile.AGGRESSIVE]: 'Aggressive',
};

export const DEFAULT_ASSET_ALLOCATION: Record<RiskProfile, {
  equity_pct: number;
  bond_pct: number;
  cash_pct: number;
  property_pct: number;
}> = {
  [RiskProfile.CONSERVATIVE]:          { equity_pct: 20, bond_pct: 50, cash_pct: 20, property_pct: 10 },
  [RiskProfile.MODERATE_CONSERVATIVE]: { equity_pct: 35, bond_pct: 40, cash_pct: 15, property_pct: 10 },
  [RiskProfile.MODERATE]:              { equity_pct: 55, bond_pct: 25, cash_pct: 10, property_pct: 10 },
  [RiskProfile.MODERATE_AGGRESSIVE]:   { equity_pct: 70, bond_pct: 15, cash_pct:  5, property_pct: 10 },
  [RiskProfile.AGGRESSIVE]:            { equity_pct: 85, bond_pct:  5, cash_pct:  5, property_pct:  5 },
};

// SA Tax constants — update annually per SARS
export const SA_TAX = {
  CGT_ANNUAL_EXCLUSION_INDIVIDUAL: 40_000,
  CGT_INCLUSION_RATE_INDIVIDUAL: 0.4,
  ESTATE_DUTY_RATE_STANDARD: 0.2,
  ESTATE_DUTY_RATE_EXCESS: 0.25,        // on estate value > R30m
  ESTATE_DUTY_EXCESS_THRESHOLD: 30_000_000,
  ESTATE_ABATEMENT: 3_500_000,
  DIVIDEND_WITHHOLDING_TAX: 0.2,
  EXECUTOR_FEES_RATE: 0.035,            // 3.5% of gross estate
} as const;

// ─── Shared Types ─────────────────────────────────────────────────────────────

// Advisor
export interface Advisor {
  id: string;
  name: string;
  email: string;
  firm_name: string;
  fsp_number?: string | null;
  logo_url?: string | null;
}

// Fund
export interface Fund {
  id: string;
  name: string;
  isin?: string;
  provider?: string;
  asset_class?: string;
  region?: string;
  benchmark?: string;
  ter?: string;
  esg_score?: number;
  christian_screen_pass?: boolean;
  morningstar_rating?: number;
  inception_date?: string;
  fact_sheet_url?: string | null;
  holdings_count?: number;
  created_at: string;
  updated_at: string;
}

// Client
export interface Client {
  id: string;
  advisor_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  id_number?: string;
  dob?: string;
  risk_profile?: string;
  tax_number?: string;
  tax_residency?: string;
  kyc_complete: boolean;
  fica_complete: boolean;
  source_of_wealth_declared: boolean;
  risk_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  risk_profile?: string;
  tax_number?: string;
}

export interface RecordOfAdvice {
  id: string;
  client_id: string;
  advisor_id: string;
  advice_date: string;
  advice_summary: string;
  pdf_url: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface ClientPortfolio {
  id: string;
  client_id: string;
  name: string;
  total_value: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ClientDetail extends Client {
  portfolios: ClientPortfolio[];
  records_of_advice: RecordOfAdvice[];
}

// Portfolio
export interface Portfolio {
  id: string;
  name: string;
  client_id: string;
  value?: number;
  inception_date?: string;
  mandate_type?: string;
  created_at: string;
}

export interface PortfolioFundAllocation {
  fund_id: string;
  allocation_pct: number;
  value?: number;
}

export interface CreatePortfolioDto {
  name: string;
  client_id: string;
  mandate_type?: string;
  inception_date?: string;
  funds?: PortfolioFundAllocation[];
}

// AI Screening
export interface AiScreeningStatus {
  fund_id: string;
  fund_name: string;
  ai_flags: number;
  manual_flags: number;
}

// Screening results
export interface CategoryExposure {
  category: CompromiseCategory;
  exposure_pct: number;
  affected_funds_count: number;
}

export interface FundScreeningResult {
  fund_id: string;
  fund_name: string;
  clean_pct: number;
  compromised_pct: number;
  by_category: CategoryExposure[];
  flagged_holdings_count: number;
}

export interface PortfolioScreeningResult {
  portfolio_id: string;
  mode: ScreeningMode;
  clean_pct: number;
  compromised_pct: number;
  by_category: CategoryExposure[];
  fund_results: FundScreeningResult[];
  passed_strict_mode: boolean;
}

export interface SimilarityScore {
  original_fund_id: string;
  candidate_fund_id: string;
  score: number;
  asset_class_match: boolean;
  region_match: boolean;
  ter_within_threshold: boolean;
  return_correlation: number;
}

export interface BehaviourProfile {
  loss_aversion: number;    // 0-100
  herding: number;          // 0-100
  recency_bias: number;     // 0-100
  overconfidence: number;   // 0-100
  notes: string;
}

export interface CGTCalculation {
  gross_gain: number;
  annual_exclusion: number;
  inclusion_rate: number;
  taxable_gain: number;
  cgt_liability: number;
  tax_year: string;
}

export interface IncomeTaxCalculation {
  taxable_income: number;
  tax_before_rebates: number;
  primary_rebate: number;
  net_tax: number;
  effective_rate: number;
  marginal_rate: number;
  tax_year: string;
}

export interface EstateDutyCalculation {
  gross_estate: number;
  abatement: number;
  dutiable_estate: number;
  duty: number;
  executor_fees: number;
  liquidity_required: number;
}

export interface RiskAnswer {
  question_id: number;
  answer_value: number;  // 1-5 scale
}

export interface ComplianceCheckResult {
  passed: boolean;
  failed_checks: string[];
}
