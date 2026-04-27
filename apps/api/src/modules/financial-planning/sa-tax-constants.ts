/**
 * SA tax constants — review and update annually.
 * Updated 2026 tax year (1 March 2025 – 28 February 2026).
 *
 * Sources: SARS Pocket Tax Guide, Income Tax Act 58 of 1962, Tax-Free
 * Investment regulations (R36k pa / R500k lifetime), Estate Duty Act.
 */

export const TAX_YEAR_LABEL = '2026 (1 Mar 2025 – 28 Feb 2026)';

/** Individual marginal income tax brackets (R per annum). */
export const INCOME_TAX_BRACKETS = [
  { upTo: 237_100, rate: 0.18, base: 0 },
  { upTo: 370_500, rate: 0.26, base: 42_678 },
  { upTo: 512_800, rate: 0.31, base: 77_362 },
  { upTo: 673_000, rate: 0.36, base: 121_475 },
  { upTo: 857_900, rate: 0.39, base: 179_147 },
  { upTo: 1_817_000, rate: 0.41, base: 251_258 },
  { upTo: Infinity, rate: 0.45, base: 644_489 },
];

export const PRIMARY_REBATE = 17_235;
export const SECONDARY_REBATE = 9_444; // 65+
export const TERTIARY_REBATE = 3_145; // 75+

export const TAX_THRESHOLD_UNDER_65 = 95_750;
export const TAX_THRESHOLD_65_TO_74 = 148_217;
export const TAX_THRESHOLD_75_PLUS = 165_689;

/** Interest exemption (s10(1)(i)). */
export const INTEREST_EXEMPTION_UNDER_65 = 23_800;
export const INTEREST_EXEMPTION_65_PLUS = 34_500;

/** Local dividends withholding tax. */
export const LOCAL_DIVIDEND_WHT_RATE = 0.20;

/** Capital gains tax. */
export const CGT_INCLUSION_INDIVIDUAL = 0.40;
export const CGT_ANNUAL_EXCLUSION = 40_000;
export const CGT_DEATH_EXCLUSION = 300_000;
export const CGT_PRIMARY_RESIDENCE_EXCLUSION = 2_000_000;

/** Section 11F retirement deduction. */
export const S11F_PERCENTAGE_CAP = 0.275;
export const S11F_RAND_CAP = 350_000;

/** Tax-Free Savings Account. */
export const TFSA_ANNUAL_LIMIT = 36_000;
export const TFSA_LIFETIME_LIMIT = 500_000;
export const TFSA_OVER_LIMIT_PENALTY = 0.40;

/** Donations tax — annual exemption per donor. */
export const DONATIONS_TAX_ANNUAL_EXEMPTION = 100_000;
export const DONATIONS_TAX_RATE = 0.20; // 25% above R30m

/** Estate Duty. */
export const ESTATE_DUTY_ABATEMENT = 3_500_000;
export const ESTATE_DUTY_RATE_FIRST = 0.20; // up to R30m
export const ESTATE_DUTY_RATE_ABOVE = 0.25; // above R30m
export const ESTATE_DUTY_THRESHOLD = 30_000_000;

/** Executor's fee. */
export const EXECUTOR_FEE_RATE = 0.035;
export const VAT_RATE = 0.15;

/** Section 7C — interest-free / low-interest loan to trust. Deemed donation. */
export const S7C_OFFICIAL_RATE = 0.0925; // SARS official rate Mar 2026 — confirm annually

/** Regulation 28 — retirement fund prudential limits. */
export const REG28_LIMITS = {
  equity: 0.75,
  property: 0.25,
  offshore: 0.45, // includes Africa
  africa_ex_sa: 0.10,
  hedge_funds: 0.10,
  private_equity: 0.15,
};

/** Living annuity drawdown band. */
export const LIVING_ANNUITY_MIN = 0.025;
export const LIVING_ANNUITY_MAX = 0.175;
