export declare enum RiskProfile {
    CONSERVATIVE = "conservative",
    MODERATE_CONSERVATIVE = "moderate_conservative",
    MODERATE = "moderate",
    MODERATE_AGGRESSIVE = "moderate_aggressive",
    AGGRESSIVE = "aggressive"
}
export declare enum ScreeningMode {
    STRICT = "strict",
    WEIGHTED = "weighted"
}
export declare enum CompromiseCategory {
    ALCOHOL = "alcohol",
    TOBACCO = "tobacco",
    GAMBLING = "gambling",
    ABORTION = "abortion",
    WEAPONS = "weapons",
    PORNOGRAPHY = "pornography",
    CANNABIS = "cannabis"
}
export declare enum FlagSource {
    MANUAL = "manual",
    AI = "ai"
}
export declare enum ComplianceStatus {
    COMPLETE = "complete",
    INCOMPLETE = "incomplete",
    PENDING = "pending"
}
export declare enum AssetClass {
    EQUITY = "equity",
    BOND = "bond",
    PROPERTY = "property",
    CASH = "cash",
    MULTI_ASSET = "multi_asset",
    COMMODITY = "commodity",
    ALTERNATIVE = "alternative"
}
export declare enum Region {
    SA = "SA",
    GLOBAL = "global",
    AFRICA = "africa",
    US = "us",
    EUROPE = "europe",
    ASIA = "asia"
}
export declare enum IngestionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETE = "complete",
    FAILED = "failed"
}
export declare enum TaxResidency {
    SA_RESIDENT = "sa_resident",
    NON_RESIDENT = "non_resident"
}
export declare enum BehaviourBias {
    LOSS_AVERSION = "loss_aversion",
    HERDING = "herding",
    RECENCY_BIAS = "recency_bias",
    OVERCONFIDENCE = "overconfidence"
}
export declare const COMPROMISE_CATEGORIES: CompromiseCategory[];
export declare const RISK_PROFILE_LABELS: Record<RiskProfile, string>;
export declare const DEFAULT_ASSET_ALLOCATION: Record<RiskProfile, {
    equity_pct: number;
    bond_pct: number;
    cash_pct: number;
    property_pct: number;
}>;
export declare const SA_TAX: {
    readonly CGT_ANNUAL_EXCLUSION_INDIVIDUAL: 40000;
    readonly CGT_INCLUSION_RATE_INDIVIDUAL: 0.4;
    readonly ESTATE_DUTY_RATE_STANDARD: 0.2;
    readonly ESTATE_DUTY_RATE_EXCESS: 0.25;
    readonly ESTATE_DUTY_EXCESS_THRESHOLD: 30000000;
    readonly ESTATE_ABATEMENT: 3500000;
    readonly DIVIDEND_WITHHOLDING_TAX: 0.2;
    readonly EXECUTOR_FEES_RATE: 0.035;
};
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
    loss_aversion: number;
    herding: number;
    recency_bias: number;
    overconfidence: number;
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
    answer_value: number;
}
export interface ComplianceCheckResult {
    passed: boolean;
    failed_checks: string[];
}
