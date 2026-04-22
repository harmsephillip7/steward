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
  FACEBOOK = 'facebook',
  WHATSAPP = 'whatsapp',
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
  GAP_COVER = 'gap_cover',
  SHORT_TERM = 'short_term',
  RETIREMENT_ANNUITY = 'retirement_annuity',
  LIVING_ANNUITY = 'living_annuity',
  ENDOWMENT = 'endowment',
  UNIT_TRUST = 'unit_trust',
  TFSA = 'tfsa',
  EDUCATION_POLICY = 'education_policy',
}

// ─── Proposal Product & Template Types ────────────────────────────────────────

export type ProposalSection =
  | 'cover_letter'
  | 'executive_summary'
  | 'client_overview'
  | 'products'
  | 'fee_disclosure'
  | 'disclaimers'
  | 'next_steps';

export interface ProposalProduct {
  id: string;
  type: ProductType;
  provider: string;
  product_name: string;
  // Risk fields
  cover_amount?: number;
  premium_monthly?: number;
  lump_sum?: number;
  term_years?: number;
  escalation_rate?: number;
  waiting_period?: string;
  payment_pattern?: string;
  // Investment fields
  initial_contribution?: number;
  monthly_contribution?: number;
  fund_selection?: string[];
  platform?: string;
  // Medical Aid / Gap Cover
  plan_name?: string;
  dependents_covered?: number;
  gap_cover_included?: boolean;
  // Short-term
  insured_item?: string;
  sum_insured?: number;
  excess?: number;
  // Generic
  notes?: string;
}

export interface ProposalTemplateType {
  id: string;
  advisor_id: string;
  name: string;
  product_types: ProductType[];
  cover_letter_template: string;
  disclaimer_text: string;
  sections_enabled: ProposalSection[];
  default_terms: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.LIFE]: 'Life Cover',
  [ProductType.DISABILITY]: 'Disability Cover',
  [ProductType.DREAD_DISEASE]: 'Dread Disease Cover',
  [ProductType.INCOME_PROTECTION]: 'Income Protection',
  [ProductType.FUNERAL]: 'Funeral Cover',
  [ProductType.MEDICAL_AID]: 'Medical Aid',
  [ProductType.GAP_COVER]: 'Gap Cover',
  [ProductType.SHORT_TERM]: 'Short-Term Insurance',
  [ProductType.RETIREMENT_ANNUITY]: 'Retirement Annuity',
  [ProductType.LIVING_ANNUITY]: 'Living Annuity',
  [ProductType.ENDOWMENT]: 'Endowment',
  [ProductType.UNIT_TRUST]: 'Unit Trust',
  [ProductType.TFSA]: 'Tax-Free Savings',
  [ProductType.EDUCATION_POLICY]: 'Education Policy',
};

export const RISK_PRODUCT_TYPES: ProductType[] = [
  ProductType.LIFE,
  ProductType.DISABILITY,
  ProductType.DREAD_DISEASE,
  ProductType.INCOME_PROTECTION,
  ProductType.FUNERAL,
];

export const INVESTMENT_PRODUCT_TYPES: ProductType[] = [
  ProductType.RETIREMENT_ANNUITY,
  ProductType.LIVING_ANNUITY,
  ProductType.ENDOWMENT,
  ProductType.UNIT_TRUST,
  ProductType.TFSA,
  ProductType.EDUCATION_POLICY,
];

export const MEDICAL_PRODUCT_TYPES: ProductType[] = [
  ProductType.MEDICAL_AID,
  ProductType.GAP_COVER,
];

export const SHORT_TERM_PRODUCT_TYPES: ProductType[] = [
  ProductType.SHORT_TERM,
];

export const DEFAULT_PROPOSAL_SECTIONS: ProposalSection[] = [
  'cover_letter',
  'executive_summary',
  'client_overview',
  'products',
  'fee_disclosure',
  'disclaimers',
  'next_steps',
];

export const DEFAULT_DISCLAIMER_TEXT = `This proposal is not a contract and does not bind either party. Product benefits, terms, and premiums are subject to the insurer's/provider's approval and underwriting requirements. Past performance is not indicative of future results. This proposal has been prepared in accordance with the Financial Advisory and Intermediary Services Act (FAIS), 2002. The advisor is an authorised financial services provider.`;

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

// ─── Messaging / Integrations ─────────────────────────────────────────────────

export enum MessageChannel {
  EMAIL = 'email',
  MESSENGER = 'messenger',
  WHATSAPP = 'whatsapp',
}

export enum MessagingProvider {
  GMAIL = 'gmail',
  MICROSOFT = 'microsoft',
  SMTP = 'smtp',
  META = 'meta',
  TWILIO = 'twilio',
  META_WHATSAPP = 'meta_whatsapp',
}

export enum MessagingConnectionStatus {
  ACTIVE = 'active',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageTemplateStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum MessageTemplateCategory {
  UTILITY = 'utility',
  MARKETING = 'marketing',
  AUTHENTICATION = 'authentication',
}

export interface MessagingConnectionType {
  id: string;
  advisor_id: string;
  channel: MessageChannel;
  provider: MessagingProvider;
  status: MessagingConnectionStatus;
  display_name: string;
  config: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
}

export interface MessageType {
  id: string;
  advisor_id: string;
  connection_id: string;
  direction: MessageDirection;
  channel: MessageChannel;
  lead_id: string | null;
  client_id: string | null;
  from_address: string;
  to_address: string;
  subject: string | null;
  body: string;
  thread_id: string | null;
  external_message_id: string | null;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

export interface MessageTemplateType {
  id: string;
  advisor_id: string;
  name: string;
  channel: MessageChannel;
  template_name: string;
  category: MessageTemplateCategory;
  language: string;
  body: string;
  header_text: string | null;
  footer_text: string | null;
  status: MessageTemplateStatus;
  external_template_id: string | null;
  created_at: string;
  updated_at: string;
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
  discovery_data?: DiscoveryData;
  analysis_data?: AnalysisData;
  stage_history?: StageHistoryEntry[];
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
  stage?: LeadStage;
  is_auto: boolean;
  created_at: string;
}

export interface ProposalType {
  id: string;
  advisor_id: string;
  lead_id?: string;
  client_id?: string;
  template_id?: string;
  title: string;
  status: ProposalStatus;
  products: ProposalProduct[];
  cover_letter?: string;
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
  // Joined from advisor for preview/PDF
  advisor?: {
    name: string;
    firm_name: string;
    fsp_number?: string;
    logo_url?: string;
    primary_colour_hex?: string;
  };
  lead?: { first_name: string; last_name: string; email?: string; phone?: string };
  client?: { first_name: string; last_name: string; email?: string; phone?: string };
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

// ── Discovery & Analysis Semi-Structured Data ───────────────────

export interface DependentDetail {
  name?: string;
  relationship?: string;
  dob?: string;
  is_student?: boolean;
  special_needs?: boolean;
  monthly_support_amount?: number;
}

export interface EducationNeed {
  dependent_name?: string;
  current_age?: number;
  education_type?: string; // primary, secondary, tertiary
  target_year?: number;
  estimated_annual_cost?: number;
  funding_in_place?: number;
}

export interface IncomeBreakdown {
  salary?: number;
  bonus_commission?: number;
  rental_income?: number;
  investment_income?: number;
  business_income?: number;
  maintenance_received?: number;
  other_income?: number;
}

export interface ExpenseBreakdown {
  housing?: number;
  transport?: number;
  food_groceries?: number;
  medical?: number;
  insurance_premiums?: number;
  education_school_fees?: number;
  entertainment_lifestyle?: number;
  debt_repayments?: number;
  savings_investments?: number;
  other_expenses?: number;
}

export interface AssetDetail {
  description?: string;
  category?: string;
  provider?: string;
  current_value?: number;
  monthly_contribution?: number;
}

export interface LiabilityDetail {
  description?: string;
  category?: string;
  provider?: string;
  outstanding_balance?: number;
  monthly_repayment?: number;
  interest_rate?: number;
}

export interface DiscoveryData {
  // ── Motivation & Goals ──
  motivation?: string;
  goals_overview?: string[];
  pain_points?: string[];
  key_concerns?: string[];

  // ── Personal Details ──
  date_of_birth?: string;
  id_number?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_id_number?: string;
  spouse_dob?: string;
  life_stage?: string;
  family_situation?: string;
  number_of_dependents?: number;
  dependents_details?: DependentDetail[];

  // ── Employment & Tax ──
  employment_status?: string;
  occupation?: string;
  employer?: string;
  industry?: string;
  years_employed?: number;
  tax_number?: string;
  tax_residency?: string;
  retirement_age_target?: number;

  // ── Health & Lifestyle ──
  smoker?: boolean;
  health_status?: string;
  health_conditions?: string;

  // ── Existing Advisor & Products ──
  has_existing_advisor?: boolean;
  current_advisor?: string;
  existing_products?: string[];

  // ── Financial Snapshot ──
  estimated_investable_assets?: number;
  estimated_monthly_income?: number;
  estimated_monthly_expenses?: number;

  // ── Communication & Notes ──
  preferred_communication?: string;
  meeting_notes?: string;
  custom_fields?: Record<string, any>;
}

export interface AnalysisData {
  // ── Risk Profile ──
  risk_tolerance_preliminary?: string;

  // ── Income Breakdown ──
  income_breakdown?: IncomeBreakdown;
  monthly_gross_income?: number;
  monthly_net_income?: number;
  monthly_total_expenses?: number;
  monthly_surplus?: number;

  // ── Expense Breakdown ──
  expense_breakdown?: ExpenseBreakdown;

  // ── Assets Breakdown ──
  assets_details?: AssetDetail[];
  total_assets?: number;

  // ── Liabilities Breakdown ──
  liabilities_details?: LiabilityDetail[];
  total_liabilities?: number;
  net_worth_estimate?: number;

  // ── Existing Risk Cover ──
  existing_life_cover?: number;
  existing_disability_cover?: number;
  existing_dread_disease_cover?: number;
  existing_income_protection?: number;
  existing_funeral_cover?: number;
  existing_medical_aid?: string;
  medical_aid_plan?: string;
  gap_cover?: boolean;

  // ── Short-Term Insurance ──
  has_short_term_insurance?: boolean;
  short_term_provider?: string;
  short_term_premiums?: number;
  homeowners_cover?: boolean;
  vehicle_cover?: boolean;
  all_risks_cover?: boolean;

  // ── Emergency Fund ──
  has_emergency_fund?: boolean;
  emergency_fund_months?: number;
  emergency_fund_value?: number;

  // ── Retirement ──
  retirement_fund_value?: number;
  retirement_monthly_contribution?: number;
  retirement_fund_type?: string; // RA, pension, provident, preservation
  ra_value?: number;
  pension_value?: number;
  provident_value?: number;
  preservation_value?: number;
  employer_contribution?: number;

  // ── Estate Planning ──
  estate_planning_status?: string;
  has_will?: boolean;
  will_last_updated?: string;
  executor_appointed?: string;
  has_trust?: boolean;
  trust_details?: string;
  beneficiary_nominations_up_to_date?: boolean;

  // ── Education Planning ──
  education_needs?: EducationNeed[];
  total_education_shortfall?: number;

  // ── Business Interests ──
  has_business_interests?: boolean;
  business_name?: string;
  business_type?: string;
  business_value?: number;
  has_buy_sell_agreement?: boolean;
  has_key_person_cover?: boolean;

  // ── Gap Analysis & Recommendations ──
  insurance_gaps?: string[];
  investment_gaps?: string[];
  tax_opportunities?: string[];
  preliminary_recommendations?: string[];
  analysis_notes?: string;
  custom_fields?: Record<string, any>;
}

export interface StageHistoryEntry {
  stage: LeadStage;
  entered_at: string;
  exited_at?: string;
}

// ── Stage Guidance Configuration ────────────────────────────────

export interface StageAction {
  key: string;
  label: string;
  /** Which data field(s) this action relates to — used for auto-completion detection */
  data_fields?: string[];
  required: boolean;
}

export interface StageGuidance {
  stage: LeadStage;
  title: string;
  description: string;
  objective: string;
  recommended_actions: StageAction[];
  suggested_tasks: { title: string; description?: string; priority: TaskPriority }[];
  tips: string[];
}

export const STAGE_GUIDANCE: Record<LeadStage, StageGuidance> = {
  [LeadStage.NEW]: {
    stage: LeadStage.NEW,
    title: 'New Lead',
    description: 'A new prospect has entered your pipeline. Capture their basic details and qualify the lead.',
    objective: 'Verify contact information and determine if this is a qualified prospect worth pursuing.',
    recommended_actions: [
      { key: 'contact_info', label: 'Verify contact information (email & phone)', data_fields: ['email', 'phone'], required: true },
      { key: 'lead_source', label: 'Record lead source', data_fields: ['source'], required: true },
      { key: 'initial_notes', label: 'Add initial notes about the lead', data_fields: ['notes'], required: false },
      { key: 'expected_value', label: 'Estimate potential value', data_fields: ['expected_value'], required: false },
    ],
    suggested_tasks: [
      { title: 'Verify contact details', description: 'Confirm email and phone number are correct', priority: TaskPriority.HIGH },
      { title: 'Research prospect background', description: 'Look up company/LinkedIn for context', priority: TaskPriority.LOW },
    ],
    tips: [
      'Respond to new leads within 24 hours for the best conversion rates.',
      'Note where the lead came from — referral leads convert at 3x the rate.',
    ],
  },
  [LeadStage.CONTACTED]: {
    stage: LeadStage.CONTACTED,
    title: 'Contacted',
    description: 'You\'ve made first contact. Build rapport and schedule an initial discovery meeting.',
    objective: 'Establish a relationship and book a discovery meeting to understand their needs.',
    recommended_actions: [
      { key: 'first_contact', label: 'Log first contact activity (call/email)', data_fields: [], required: true },
      { key: 'schedule_discovery', label: 'Schedule a discovery meeting', data_fields: [], required: true },
      { key: 'send_intro', label: 'Send introduction / welcome communication', data_fields: [], required: false },
    ],
    suggested_tasks: [
      { title: 'Make introductory call', description: 'Introduce yourself and your services', priority: TaskPriority.HIGH },
      { title: 'Send welcome email', description: 'Send introduction email with firm overview', priority: TaskPriority.MEDIUM },
      { title: 'Schedule discovery meeting', description: 'Book a 60-minute discovery session', priority: TaskPriority.HIGH },
    ],
    tips: [
      'Focus on listening, not selling. Ask open-ended questions about their financial concerns.',
      'Send a brief agenda ahead of the discovery meeting so they feel prepared.',
    ],
  },
  [LeadStage.DISCOVERY]: {
    stage: LeadStage.DISCOVERY,
    title: 'Discovery',
    description: 'Conduct a thorough discovery meeting to understand the prospect\'s financial goals, current situation, and concerns.',
    objective: 'Gather enough information to perform a meaningful financial analysis and needs assessment.',
    recommended_actions: [
      { key: 'goals', label: 'Capture financial goals', data_fields: ['discovery_data.goals_overview'], required: true },
      { key: 'pain_points', label: 'Identify pain points and concerns', data_fields: ['discovery_data.pain_points', 'discovery_data.key_concerns'], required: true },
      { key: 'personal_details', label: 'Record personal details (DOB, ID, marital status)', data_fields: ['discovery_data.date_of_birth', 'discovery_data.id_number', 'discovery_data.marital_status'], required: true },
      { key: 'family', label: 'Record family & dependent information', data_fields: ['discovery_data.family_situation', 'discovery_data.number_of_dependents', 'discovery_data.dependents_details'], required: true },
      { key: 'employment', label: 'Capture employment & tax details', data_fields: ['discovery_data.employment_status', 'discovery_data.occupation', 'discovery_data.employer'], required: true },
      { key: 'health', label: 'Record health & lifestyle information', data_fields: ['discovery_data.smoker', 'discovery_data.health_status'], required: false },
      { key: 'existing_products', label: 'Document existing financial products', data_fields: ['discovery_data.existing_products'], required: true },
      { key: 'income_expenses', label: 'Get rough income & expense picture', data_fields: ['discovery_data.estimated_monthly_income', 'discovery_data.estimated_monthly_expenses'], required: false },
      { key: 'assets_estimate', label: 'Estimate investable assets', data_fields: ['discovery_data.estimated_investable_assets'], required: false },
      { key: 'meeting_notes', label: 'Complete discovery meeting notes', data_fields: ['discovery_data.meeting_notes'], required: true },
    ],
    suggested_tasks: [
      { title: 'Conduct discovery meeting', description: 'Complete 60-min discovery session covering goals, family, current finances', priority: TaskPriority.HIGH },
      { title: 'Request existing policy documents', description: 'Ask client to share current policy schedules and statements', priority: TaskPriority.MEDIUM },
      { title: 'Send discovery summary to prospect', description: 'Email a summary of what was discussed for confirmation', priority: TaskPriority.MEDIUM },
    ],
    tips: [
      'Use the SPIN technique: Situation, Problem, Implication, Need-Payoff questions.',
      'Ask "What keeps you up at night financially?" to uncover hidden concerns.',
      'Document everything — these notes will form the basis of your Financial Needs Analysis.',
      'Ask about their existing advisor relationship tactfully — understand why they\'re considering a change.',
    ],
  },
  [LeadStage.ANALYSIS]: {
    stage: LeadStage.ANALYSIS,
    title: 'Analysis',
    description: 'Analyse the prospect\'s financial situation, identify gaps, and assess their risk profile to prepare tailored recommendations.',
    objective: 'Complete the Financial Needs Analysis (FNA) and identify insurance, investment, and planning gaps.',
    recommended_actions: [
      { key: 'risk_profile', label: 'Assess risk tolerance', data_fields: ['analysis_data.risk_tolerance_preliminary'], required: true },
      { key: 'income_analysis', label: 'Analyse income & expenses in detail', data_fields: ['analysis_data.income_breakdown', 'analysis_data.expense_breakdown', 'analysis_data.monthly_surplus'], required: true },
      { key: 'net_worth', label: 'Calculate detailed net worth', data_fields: ['analysis_data.assets_details', 'analysis_data.liabilities_details', 'analysis_data.net_worth_estimate'], required: true },
      { key: 'insurance_gaps', label: 'Identify insurance gaps', data_fields: ['analysis_data.insurance_gaps', 'analysis_data.existing_life_cover', 'analysis_data.existing_disability_cover'], required: true },
      { key: 'investment_gaps', label: 'Identify investment & savings gaps', data_fields: ['analysis_data.investment_gaps', 'analysis_data.retirement_fund_value'], required: true },
      { key: 'emergency_fund', label: 'Assess emergency fund status', data_fields: ['analysis_data.has_emergency_fund', 'analysis_data.emergency_fund_months'], required: false },
      { key: 'estate_planning', label: 'Review estate planning', data_fields: ['analysis_data.has_will', 'analysis_data.estate_planning_status'], required: false },
      { key: 'recommendations', label: 'Draft preliminary recommendations', data_fields: ['analysis_data.preliminary_recommendations'], required: true },
      { key: 'analysis_notes', label: 'Complete analysis notes', data_fields: ['analysis_data.analysis_notes'], required: false },
    ],
    suggested_tasks: [
      { title: 'Complete risk profile questionnaire', description: 'Guide prospect through risk profiling exercise', priority: TaskPriority.HIGH },
      { title: 'Perform insurance needs analysis', description: 'Calculate life cover, disability, and dread disease shortfalls', priority: TaskPriority.HIGH },
      { title: 'Review existing policies', description: 'Analyse current policies for suitability and gaps', priority: TaskPriority.HIGH },
      { title: 'Calculate retirement shortfall', description: 'Project retirement needs vs current provision', priority: TaskPriority.MEDIUM },
      { title: 'Draft Financial Needs Analysis', description: 'Prepare the FNA document', priority: TaskPriority.HIGH },
    ],
    tips: [
      'Use the "Rule of 72" to quickly illustrate the impact of fees and returns to clients.',
      'Life cover needs: 10x annual income as a starting guideline, adjust for debts and dependents.',
      'Check for Section 14 replacement requirements if recommending changes to existing policies.',
      'Consider tax implications: RA contributions are deductible up to 27.5% of taxable income (max R350k/year).',
    ],
  },
  [LeadStage.PROPOSAL]: {
    stage: LeadStage.PROPOSAL,
    title: 'Proposal',
    description: 'Present your recommendations and financial proposal to the prospect.',
    objective: 'Create and deliver a compelling proposal that addresses the prospect\'s identified needs and goals.',
    recommended_actions: [
      { key: 'create_proposal', label: 'Create a formal proposal', data_fields: [], required: true },
      { key: 'prepare_roa', label: 'Prepare Record of Advice draft', data_fields: [], required: true },
      { key: 'schedule_presentation', label: 'Schedule proposal presentation meeting', data_fields: [], required: true },
      { key: 'send_proposal', label: 'Send proposal to prospect', data_fields: [], required: false },
    ],
    suggested_tasks: [
      { title: 'Create proposal document', description: 'Build proposal with recommended products and projections', priority: TaskPriority.HIGH },
      { title: 'Prepare Record of Advice', description: 'Draft ROA documenting rationale for recommendations', priority: TaskPriority.HIGH },
      { title: 'Get product quotes', description: 'Request quotes from product providers', priority: TaskPriority.MEDIUM },
      { title: 'Schedule proposal meeting', description: 'Book meeting to present recommendations', priority: TaskPriority.HIGH },
    ],
    tips: [
      'Present no more than 3 options — too many choices lead to decision paralysis.',
      'Always tie recommendations back to the goals and concerns identified in discovery.',
      'Include a clear comparison to their current situation to show the value of change.',
      'Prepare for common objections: "I need to think about it", "Can I afford this?", "What about my current advisor?"',
    ],
  },
  [LeadStage.NEGOTIATION]: {
    stage: LeadStage.NEGOTIATION,
    title: 'Negotiation',
    description: 'The prospect is considering your proposal. Address questions, handle objections, and work toward commitment.',
    objective: 'Secure the prospect\'s agreement to proceed and prepare for client onboarding.',
    recommended_actions: [
      { key: 'follow_up', label: 'Follow up on proposal', data_fields: [], required: true },
      { key: 'address_objections', label: 'Address any objections or concerns', data_fields: [], required: false },
      { key: 'final_adjustments', label: 'Make any final proposal adjustments', data_fields: [], required: false },
      { key: 'get_commitment', label: 'Obtain verbal or written commitment', data_fields: [], required: true },
    ],
    suggested_tasks: [
      { title: 'Follow up on proposal', description: 'Check if prospect has questions or needs clarification', priority: TaskPriority.HIGH },
      { title: 'Address client objections', description: 'Document and resolve any concerns raised', priority: TaskPriority.HIGH },
      { title: 'Finalise proposal terms', description: 'Make any agreed adjustments to the proposal', priority: TaskPriority.MEDIUM },
      { title: 'Prepare onboarding documents', description: 'Get FICA, mandate, and application forms ready', priority: TaskPriority.MEDIUM },
    ],
    tips: [
      'The biggest objection is usually unspoken. Ask: "Is there anything holding you back from moving forward?"',
      'Create urgency without pressure — mention tax year deadlines, market conditions, or cover waiting periods.',
      'If the prospect wants to "think about it", schedule a specific follow-up date and time.',
    ],
  },
  [LeadStage.WON]: {
    stage: LeadStage.WON,
    title: 'Won — Client Onboarding',
    description: 'Congratulations! The prospect has committed. Now convert them to a client and complete the onboarding process.',
    objective: 'Convert the lead to a client record, complete FICA/KYC, and submit all required documentation.',
    recommended_actions: [
      { key: 'convert_to_client', label: 'Convert lead to client record', data_fields: ['converted_client_id'], required: true },
      { key: 'start_onboarding', label: 'Start onboarding checklist', data_fields: [], required: true },
      { key: 'collect_documents', label: 'Collect all required documents', data_fields: [], required: true },
      { key: 'submit_applications', label: 'Submit product applications', data_fields: [], required: false },
    ],
    suggested_tasks: [
      { title: 'Convert lead to client', description: 'Create client record from lead data', priority: TaskPriority.URGENT },
      { title: 'Collect FICA documents', description: 'ID copy, proof of address, proof of income', priority: TaskPriority.HIGH },
      { title: 'Complete risk profile questionnaire', description: 'Formal risk profiling for records', priority: TaskPriority.HIGH },
      { title: 'Get Record of Advice signed', description: 'Present and sign the ROA', priority: TaskPriority.HIGH },
      { title: 'Submit product applications', description: 'Complete and submit all application forms', priority: TaskPriority.HIGH },
      { title: 'Set up debit order / mandate', description: 'Arrange premium collection method', priority: TaskPriority.MEDIUM },
    ],
    tips: [
      'Send a welcome pack within 24 hours of commitment.',
      'Set expectations for the onboarding timeline — typically 2-4 weeks.',
      'Schedule a 30-day check-in to confirm everything is in order.',
    ],
  },
  [LeadStage.LOST]: {
    stage: LeadStage.LOST,
    title: 'Lost',
    description: 'This lead did not convert. Record the reason and plan any future re-engagement.',
    objective: 'Document why the lead was lost for future learning and plan potential re-engagement.',
    recommended_actions: [
      { key: 'lost_reason', label: 'Record reason for losing the lead', data_fields: ['lost_reason'], required: true },
      { key: 'feedback', label: 'Request feedback from the prospect', data_fields: [], required: false },
    ],
    suggested_tasks: [
      { title: 'Record lost reason', description: 'Document why this prospect did not convert', priority: TaskPriority.MEDIUM },
      { title: 'Schedule re-engagement reminder', description: 'Set a 6-month reminder to re-engage', priority: TaskPriority.LOW },
    ],
    tips: [
      'Always part on good terms — lost leads can become future clients or referral sources.',
      'Analyse lost reasons quarterly to identify patterns in your sales process.',
    ],
  },
};

/** Helper: compute stage completion percentage based on lead data and guidance actions */
export function computeStageProgress(lead: LeadType, stage: LeadStage): { completed: number; total: number; pct: number; completedKeys: string[] } {
  const guidance = STAGE_GUIDANCE[stage];
  if (!guidance) return { completed: 0, total: 0, pct: 0, completedKeys: [] };

  const actions = guidance.recommended_actions;
  const completedKeys: string[] = [];

  for (const action of actions) {
    let isComplete = false;
    if (action.data_fields && action.data_fields.length > 0) {
      isComplete = action.data_fields.some(field => {
        const parts = field.split('.');
        let value: any = lead;
        for (const part of parts) {
          value = value?.[part];
        }
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'number') return true;
        if (typeof value === 'boolean') return true;
        return !!value;
      });
    }
    // Check activities-based completion for actions without data_fields
    if (!action.data_fields || action.data_fields.length === 0) {
      // These are activity-based — check if there are activities/tasks matching this stage
      if (action.key === 'first_contact') isComplete = (lead.activities?.length ?? 0) > 0;
      if (action.key === 'convert_to_client') isComplete = !!lead.converted_client_id;
    }
    if (isComplete) completedKeys.push(action.key);
  }

  const total = actions.length;
  const completed = completedKeys.length;
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0, completedKeys };
}
