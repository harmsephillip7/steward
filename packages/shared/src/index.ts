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

// ─── New Enums (Sprint 1+) ──────────────────────────────────────────────────

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED_COP = 'married_cop',
  MARRIED_AOP = 'married_aop',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  LIFE_PARTNER = 'life_partner',
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  SELF_EMPLOYED = 'self_employed',
  RETIRED = 'retired',
  UNEMPLOYED = 'unemployed',
  STUDENT = 'student',
}

export enum HealthStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum DependentRelationship {
  CHILD = 'child',
  SPOUSE = 'spouse',
  PARENT = 'parent',
  SIBLING = 'sibling',
  OTHER = 'other',
}

export enum ClientAssetCategory {
  PROPERTY = 'property',
  VEHICLE = 'vehicle',
  INVESTMENT = 'investment',
  RETIREMENT_FUND = 'retirement_fund',
  TFSA = 'tfsa',
  RA = 'ra',
  SAVINGS = 'savings',
  BUSINESS = 'business',
  COLLECTIBLE = 'collectible',
  OTHER = 'other',
}

export enum LiabilityCategory {
  MORTGAGE = 'mortgage',
  VEHICLE_FINANCE = 'vehicle_finance',
  PERSONAL_LOAN = 'personal_loan',
  CREDIT_CARD = 'credit_card',
  STUDENT_LOAN = 'student_loan',
  OVERDRAFT = 'overdraft',
  OTHER = 'other',
}

export enum InsurancePolicyType {
  LIFE = 'life',
  DISABILITY = 'disability',
  DREAD_DISEASE = 'dread_disease',
  INCOME_PROTECTION = 'income_protection',
  FUNERAL = 'funeral',
  MEDICAL_AID = 'medical_aid',
  GAP_COVER = 'gap_cover',
  SHORT_TERM = 'short_term',
}

export enum InsurancePolicyStatus {
  ACTIVE = 'active',
  LAPSED = 'lapsed',
  CANCELLED = 'cancelled',
  CLAIMED = 'claimed',
}

export enum GoalCategory {
  RETIREMENT = 'retirement',
  EDUCATION = 'education',
  PROPERTY = 'property',
  EMERGENCY = 'emergency',
  TRAVEL = 'travel',
  DEBT_FREEDOM = 'debt_freedom',
  WEALTH_BUILDING = 'wealth_building',
  OTHER = 'other',
}

export enum GoalPriority {
  ESSENTIAL = 'essential',
  IMPORTANT = 'important',
  NICE_TO_HAVE = 'nice_to_have',
}

export enum GoalStatus {
  ACTIVE = 'active',
  ACHIEVED = 'achieved',
  ABANDONED = 'abandoned',
}

export enum LifeEventType {
  MARRIAGE = 'marriage',
  DIVORCE = 'divorce',
  CHILD_BORN = 'child_born',
  PROPERTY_PURCHASE = 'property_purchase',
  PROPERTY_SALE = 'property_sale',
  JOB_CHANGE = 'job_change',
  RETIREMENT = 'retirement',
  INHERITANCE = 'inheritance',
  MEDICAL_DIAGNOSIS = 'medical_diagnosis',
  DEATH_IN_FAMILY = 'death_in_family',
  EMIGRATION = 'emigration',
  RETRENCHMENT = 'retrenchment',
}

export enum IncomeExpenseType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum Frequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ONCE_OFF = 'once_off',
}

export enum LeadSource {
  REFERRAL = 'referral',
  WEBSITE = 'website',
  EVENT = 'event',
  COLD_CALL = 'cold_call',
  SOCIAL_MEDIA = 'social_media',
  EXISTING_CLIENT = 'existing_client',
}

export enum LeadStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  DISCOVERY = 'discovery',
  ANALYSIS = 'analysis',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  TASK = 'task',
  DOCUMENT = 'document',
  SMS = 'sms',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ProposalStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum OnboardingStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum ProductType {
  LIFE = 'life',
  DISABILITY = 'disability',
  DREAD_DISEASE = 'dread_disease',
  INCOME_PROTECTION = 'income_protection',
  FUNERAL = 'funeral',
  MEDICAL_AID = 'medical_aid',
  RETIREMENT_ANNUITY = 'retirement_annuity',
  LIVING_ANNUITY = 'living_annuity',
  ENDOWMENT = 'endowment',
  UNIT_TRUST = 'unit_trust',
  TFSA = 'tfsa',
  EDUCATION_POLICY = 'education_policy',
}

export enum QuoteStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  PRESENTED = 'presented',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export enum ContributionFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  LUMP_SUM = 'lump_sum',
}

export enum DocumentType {
  ID_COPY = 'id_copy',
  PROOF_OF_ADDRESS = 'proof_of_address',
  PROOF_OF_INCOME = 'proof_of_income',
  BANK_CONFIRMATION = 'bank_confirmation',
  TAX_CERTIFICATE = 'tax_certificate',
  FICA_DECLARATION = 'fica_declaration',
  SECTION_14_NOTICE = 'section_14_notice',
  MANDATE = 'mandate',
  DEBIT_ORDER = 'debit_order',
  APPLICATION_FORM = 'application_form',
  MEDICAL_REPORT = 'medical_report',
  WILL = 'will',
  TRUST_DEED = 'trust_deed',
  OTHER = 'other',
}

export enum ReviewType {
  ANNUAL = 'annual',
  TRIGGER_EVENT = 'trigger_event',
  REGULATORY = 'regulatory',
}

export enum ConflictType {
  REMUNERATION = 'remuneration',
  THIRD_PARTY = 'third_party',
  PERSONAL = 'personal',
  OWNERSHIP = 'ownership',
}

export enum CommissionType {
  INITIAL = 'initial',
  ONGOING = 'ongoing',
  PERFORMANCE = 'performance',
  FEE_BASED = 'fee_based',
}

export enum CommissionStatus {
  EXPECTED = 'expected',
  RECEIVED = 'received',
  DISPUTED = 'disputed',
  CLAWED_BACK = 'clawed_back',
}

export enum IntegrationProvider {
  BANK_FEED = 'bank_feed',
  CREDIT_BUREAU = 'credit_bureau',
  PROPERTY_VALUATION = 'property_valuation',
  PRODUCT_PROVIDER = 'product_provider',
  TAX_AUTHORITY = 'tax_authority',
}

export enum SyncFrequency {
  MANUAL = 'manual',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum SyncStatus {
  STARTED = 'started',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum AdvisoryCategory {
  INVESTMENT = 'investment',
  INSURANCE = 'insurance',
  TAX = 'tax',
  ESTATE = 'estate',
  DEBT = 'debt',
  RETIREMENT = 'retirement',
  BUDGET = 'budget',
  GENERAL = 'general',
}

export enum AdvisoryPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum AdvisoryStatus {
  PENDING = 'pending',
  DISCUSSED = 'discussed',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  IMPLEMENTED = 'implemented',
}

export enum RegulatoryReturnType {
  FSCA_ANNUAL = 'fsca_annual',
  FAIS_COMPLIANCE = 'fais_compliance',
  TCF_REPORT = 'tcf_report',
  COMPLAINTS_REGISTER = 'complaints_register',
}

export enum RegulatoryReturnStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
}

export enum FirmRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  ADVISOR = 'advisor',
  ASSISTANT = 'assistant',
  COMPLIANCE_OFFICER = 'compliance_officer',
  VIEWER = 'viewer',
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
  // Extended profile
  marital_status?: MaritalStatus;
  spouse_name?: string;
  spouse_id_number?: string;
  spouse_dob?: string;
  employment_status?: EmploymentStatus;
  occupation?: string;
  employer?: string;
  industry?: string;
  retirement_age_target?: number;
  smoker?: boolean;
  health_status?: HealthStatus;
  annual_gross_income?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Client sub-entities
export interface ClientDependent {
  id: string;
  client_id: string;
  name: string;
  relationship: DependentRelationship;
  dob?: string;
  is_student: boolean;
  special_needs: boolean;
  monthly_support_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientAssetType {
  id: string;
  client_id: string;
  category: ClientAssetCategory;
  description: string;
  provider?: string;
  current_value: number;
  purchase_value?: number;
  purchase_date?: string;
  account_number?: string;
  monthly_contribution?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ClientLiability {
  id: string;
  client_id: string;
  category: LiabilityCategory;
  description: string;
  provider?: string;
  outstanding_balance: number;
  monthly_repayment: number;
  interest_rate?: number;
  maturity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInsurancePolicy {
  id: string;
  client_id: string;
  type: InsurancePolicyType;
  provider?: string;
  policy_number?: string;
  cover_amount: number;
  monthly_premium: number;
  inception_date?: string;
  expiry_date?: string;
  beneficiaries?: Record<string, any>[];
  status: InsurancePolicyStatus;
  created_at: string;
  updated_at: string;
}

export interface ClientFinancialGoal {
  id: string;
  client_id: string;
  name: string;
  category: GoalCategory;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  priority: GoalPriority;
  monthly_contribution?: number;
  notes?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface ClientLifeEvent {
  id: string;
  client_id: string;
  type: LifeEventType;
  event_date: string;
  description?: string;
  financial_impact?: number;
  advice_trigger: boolean;
  reviewed_at?: string;
  created_at: string;
}

export interface ClientIncomeExpense {
  id: string;
  client_id: string;
  type: IncomeExpenseType;
  category: string;
  description?: string;
  amount: number;
  frequency: Frequency;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientFullProfile extends Client {
  portfolios: ClientPortfolio[];
  records_of_advice: RecordOfAdvice[];
  dependents: ClientDependent[];
  assets: ClientAssetType[];
  liabilities: ClientLiability[];
  insurance_policies: ClientInsurancePolicy[];
  financial_goals: ClientFinancialGoal[];
  life_events: ClientLifeEvent[];
  income_expenses: ClientIncomeExpense[];
}

export interface NetWorthSummary {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  assets_by_category: Record<string, number>;
  liabilities_by_category: Record<string, number>;
}

export interface CashFlowSummary {
  monthly_income: number;
  monthly_expenses: number;
  monthly_surplus: number;
  items: ClientIncomeExpense[];
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
  dependents?: ClientDependent[];
  assets?: ClientAssetType[];
  liabilities?: ClientLiability[];
  insurance_policies?: ClientInsurancePolicy[];
  financial_goals?: ClientFinancialGoal[];
  life_events?: ClientLifeEvent[];
  income_expenses?: ClientIncomeExpense[];
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

// ── CRM Types ───────────────────────────────────────────────────

export interface LeadType {
  id: string;
  advisor_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  stage: LeadStage;
  priority: TaskPriority;
  assigned_to?: string;
  notes?: string;
  expected_value?: number;
  expected_close_date?: string;
  lost_reason?: string;
  converted_client_id?: string;
  activities?: ActivityRecord[];
  tasks?: TaskType[];
  created_at: string;
  updated_at: string;
}

export interface ActivityRecord {
  id: string;
  advisor_id: string;
  lead_id?: string;
  client_id?: string;
  type: string;
  subject: string;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface TaskType {
  id: string;
  advisor_id: string;
  lead_id?: string;
  client_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  priority: TaskPriority;
  created_at: string;
}

export interface ProposalType {
  id: string;
  advisor_id: string;
  lead_id?: string;
  client_id?: string;
  title: string;
  status: ProposalStatus;
  products?: any[];
  total_monthly_premium?: number;
  total_lump_sum?: number;
  valid_until?: string;
  notes?: string;
  pdf_url?: string;
  sent_at?: string;
  viewed_at?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingChecklistType {
  id: string;
  client_id: string;
  advisor_id: string;
  status: OnboardingStatus;
  items: OnboardingItem[];
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingItem {
  key: string;
  label: string;
  required: boolean;
  completed: boolean;
  completed_at?: string;
  document_id?: string;
}

export interface PipelineSummary {
  stage: LeadStage;
  count: number;
  total_value: number;
}

// ── Document Types ──────────────────────────────────────────────

export interface DocumentRecord {
  id: string;
  advisor_id: string;
  client_id?: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  file_url: string;
  mime_type?: string;
  file_size: number;
  uploaded_by?: string;
  metadata?: Record<string, any>;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentStats {
  total: number;
  byType: Record<string, number>;
  totalSize: number;
  expiringSoon: number;
}

// ── Advisory Types ──────────────────────────────────────────────

export interface AdvisoryRecommendationType {
  id: string;
  advisor_id: string;
  client_id: string;
  category: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  rationale?: string;
  action_items?: { step: string; completed: boolean }[];
  ai_context?: Record<string, any>;
  reviewed_at?: string;
  implemented_at?: string;
  dismissed_at?: string;
  dismiss_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvisoryDashboard {
  total: number;
  pending: number;
  critical: number;
  implemented: number;
  byCategory: Record<string, number>;
}

// ── Enhanced Compliance Types ───────────────────────────────────

export interface ComplianceReviewType {
  id: string;
  advisor_id: string;
  client_id: string;
  review_type: string;
  checklist: { item: string; completed: boolean; notes?: string }[];
  findings?: string;
  next_review_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConflictOfInterestType {
  id: string;
  advisor_id: string;
  client_id?: string;
  conflict_type: string;
  description: string;
  parties_involved?: string;
  mitigation?: string;
  disclosed_date?: string;
  resolved_date?: string;
  created_at: string;
}

export interface RegulatoryReturnType2 {
  id: string;
  advisor_id: string;
  return_type: string;
  status: string;
  due_date: string;
  period_start: string;
  period_end: string;
  submitted_date?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface ComplianceDashboard {
  overdueReviews: number;
  pendingReviews: number;
  openConflicts: number;
  upcomingReturns: number;
  reviewsDue30Days: number;
}

// ── Commission Types ────────────────────────────────────────────

export interface CommissionRecord {
  id: string;
  advisor_id: string;
  client_id?: string;
  product_name?: string;
  commission_type: string;
  status: string;
  amount: number;
  vat_amount: number;
  net_amount: number;
  effective_date: string;
  received_date?: string;
  reconciled_date?: string;
  notes?: string;
  created_at: string;
}

export interface CommissionSummary {
  totalReceived: number;
  totalExpected: number;
  totalVAT: number;
  byMonth: { month: string; amount: number }[];
  byType: Record<string, number>;
}

export interface IntegrationRecord {
  id: string;
  advisor_id: string;
  provider: string;
  name: string;
  is_active: boolean;
  sync_frequency: string;
  last_sync_at?: string;
  last_sync_status?: string;
  config?: Record<string, any>;
  created_at: string;
}

// ── Firm Types ──────────────────────────────────────────────────

export interface FirmType {
  id: string;
  name: string;
  fsp_number?: string;
  registration_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
  members?: FirmMemberType[];
  teams?: TeamType[];
  created_at: string;
  updated_at: string;
}

export interface FirmMemberType {
  id: string;
  firm_id: string;
  advisor_id: string;
  role: FirmRole;
  permissions?: Record<string, boolean>;
  is_active: boolean;
  advisor?: { id: string; name: string; email: string };
  created_at: string;
}

export interface TeamType {
  id: string;
  firm_id: string;
  name: string;
  lead_advisor_id?: string;
  members?: TeamMemberType[];
  created_at: string;
}

export interface TeamMemberType {
  id: string;
  team_id: string;
  advisor_id: string;
  role?: string;
  advisor?: { id: string; name: string; email: string };
}
