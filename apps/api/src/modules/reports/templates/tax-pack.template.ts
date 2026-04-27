import { ReportContext, escapeHtml, fmtZAR, pageWrap } from './_layout';
import { TAX_YEAR_LABEL } from '../../financial-planning/sa-tax-constants';

/**
 * IT3-style Tax Pack — what the client gives to their tax practitioner.
 * Aggregates everything Steward knows about the client's investments held
 * with this advisor: interest, dividends, capital gains, RA contributions,
 * TFSA contributions, donations, foreign income.
 *
 * NOTE: this is a *summary* — issuers (LISPs, banks) issue the legally
 * required IT3(b)/(c)/(s) certificates directly. This pack helps the
 * practitioner reconcile and prepare the ITR12 efficiently.
 */

export interface TaxPackInput {
  ctx: ReportContext;
  tax_year_label?: string;

  /** IT3(b) — interest, dividends, foreign income. */
  it3b: {
    local_interest: Array<{ source: string; amount: number; account_ref?: string }>;
    foreign_interest: Array<{ source: string; amount_zar: number; foreign_currency?: string; foreign_amount?: number }>;
    local_dividends: Array<{ source: string; amount: number; wht_paid: number }>;
    foreign_dividends: Array<{ source: string; amount_zar: number; foreign_tax_credit?: number }>;
    reit_distributions: Array<{ source: string; amount: number }>;
  };

  /** IT3(c) — capital gains and losses on disposals. */
  it3c: Array<{
    instrument: string;
    proceeds: number;
    base_cost: number;
    gain_or_loss: number;
    disposal_date: string;
    holding_period_days: number;
  }>;

  /** IT3(s) — TFSA contributions and growth. */
  it3s: {
    contributions_this_year: number;
    contributions_lifetime: number;
    interest_in_tfsa: number;
    dividends_in_tfsa: number;
    capital_growth_in_tfsa: number;
    over_contribution_warning?: string;
  };

  /** Section 11F — retirement contributions (RA / pension / provident). */
  retirement_contributions: Array<{
    fund_name: string;
    fund_type: 'RA' | 'pension' | 'provident' | 'preservation';
    contributions_this_year: number;
    irp5_code_4006_or_4001?: string; // 4006 = RA, 4001 = pension, 4003 = provident
  }>;

  /** Section 18A — donations to qualifying PBOs. */
  s18a_donations: Array<{ pbo_name: string; pbo_number: string; amount: number; receipt_ref?: string }>;

  /** Optional medical contributions (if collected). */
  medical_contributions?: { scheme_name: string; main_member_only: boolean; total_contributions: number; dependants?: number };

  /** Optional rental income (informational only). */
  rental_income?: Array<{ property_address: string; gross_income: number; deductible_expenses: number }>;

  /** Practitioner-friendly notes from the advisor. */
  advisor_notes?: string;
}

function totalLineItems<T extends { amount?: number; amount_zar?: number; gain_or_loss?: number; contributions_this_year?: number }>(
  arr: T[] | undefined,
  field: keyof T,
): number {
  if (!arr) return 0;
  return arr.reduce((s, x) => s + Number((x as any)[field] || 0), 0);
}

export function buildTaxPack(input: TaxPackInput): string {
  const { ctx, it3b, it3c, it3s, retirement_contributions, s18a_donations } = input;
  const taxYear = input.tax_year_label || TAX_YEAR_LABEL;

  const localInterestTotal = totalLineItems(it3b.local_interest, 'amount' as any);
  const foreignInterestTotal = totalLineItems(it3b.foreign_interest, 'amount_zar' as any);
  const localDivTotal = totalLineItems(it3b.local_dividends, 'amount' as any);
  const foreignDivTotal = totalLineItems(it3b.foreign_dividends, 'amount_zar' as any);
  const reitTotal = totalLineItems(it3b.reit_distributions, 'amount' as any);

  const cgtNet = it3c.reduce((s, x) => s + Number(x.gain_or_loss || 0), 0);
  const cgtGains = it3c.filter((x) => x.gain_or_loss > 0).reduce((s, x) => s + x.gain_or_loss, 0);
  const cgtLosses = it3c.filter((x) => x.gain_or_loss < 0).reduce((s, x) => s + x.gain_or_loss, 0);

  const raTotal = totalLineItems(retirement_contributions, 'contributions_this_year' as any);
  const donationsTotal = s18a_donations.reduce((s, x) => s + Number(x.amount || 0), 0);

  const itr12Map: Array<[string, string]> = [
    ['Local interest received (s10(1)(i) exemption applies)', 'ITR12 § Investment income'],
    ['Local dividends', 'ITR12 § Dividend income (already taxed via DWT)'],
    ['REIT distributions', 'ITR12 § Investment income — taxable as income'],
    ['Foreign interest / dividends', 'ITR12 § Foreign investment income'],
    ['Capital gains / losses', 'ITR12 § Capital gain/loss (40% inclusion)'],
    ['Retirement fund contributions', 'ITR12 § Retirement annuity contributions (s11F deduction)'],
    ['TFSA — informational only', 'ITR12 § Tax-free investments (no tax due unless over-contributed)'],
    ['Section 18A donations', 'ITR12 § Donations to PBOs (deductible up to 10% of taxable income)'],
  ];

  const body = `
    <div class="callout">
      <strong>Tax Year:</strong> ${escapeHtml(taxYear)}<br/>
      This pack summarises investment activity that Steward holds for this client. Hand it to your
      tax practitioner alongside the official IT3(b), IT3(c) and IT3(s) certificates issued by
      product providers. Steward is not a registered tax practitioner; this document does not
      constitute tax advice.
    </div>

    <h2>1. IT3(b) — Investment Income</h2>

    <h3>1.1 Local interest (taxable, partial exemption)</h3>
    <table>
      <thead><tr><th>Source</th><th>Account ref</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${it3b.local_interest.length === 0 ? '<tr><td colspan="3" class="small">No local interest recorded.</td></tr>' : ''}
        ${it3b.local_interest
          .map(
            (i) =>
              `<tr><td>${escapeHtml(i.source)}</td><td>${escapeHtml(i.account_ref ?? '')}</td><td class="num">${fmtZAR(i.amount)}</td></tr>`,
          )
          .join('')}
        <tr class="totals-row"><td colspan="2">Total local interest</td><td class="num">${fmtZAR(localInterestTotal)}</td></tr>
      </tbody>
    </table>

    <h3>1.2 Local dividends (DWT 20% withheld at source)</h3>
    <table>
      <thead><tr><th>Source</th><th class="num">Gross</th><th class="num">DWT paid</th></tr></thead>
      <tbody>
        ${it3b.local_dividends.length === 0 ? '<tr><td colspan="3" class="small">No local dividends recorded.</td></tr>' : ''}
        ${it3b.local_dividends
          .map(
            (d) =>
              `<tr><td>${escapeHtml(d.source)}</td><td class="num">${fmtZAR(d.amount)}</td><td class="num">${fmtZAR(d.wht_paid)}</td></tr>`,
          )
          .join('')}
        <tr class="totals-row"><td>Total local dividends</td><td class="num">${fmtZAR(localDivTotal)}</td><td class="num">${fmtZAR(it3b.local_dividends.reduce((s, d) => s + (d.wht_paid || 0), 0))}</td></tr>
      </tbody>
    </table>

    <h3>1.3 REIT distributions (taxable as income, no s10(1)(k))</h3>
    <table>
      <thead><tr><th>Source</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${it3b.reit_distributions.length === 0 ? '<tr><td colspan="2" class="small">No REIT distributions.</td></tr>' : ''}
        ${it3b.reit_distributions.map((r) => `<tr><td>${escapeHtml(r.source)}</td><td class="num">${fmtZAR(r.amount)}</td></tr>`).join('')}
        <tr class="totals-row"><td>Total REITs</td><td class="num">${fmtZAR(reitTotal)}</td></tr>
      </tbody>
    </table>

    <h3>1.4 Foreign income (taxable in full, foreign tax credits applicable)</h3>
    <table>
      <thead><tr><th>Source</th><th>Type</th><th class="num">ZAR</th><th class="num">FX (orig)</th><th class="num">Tax credit</th></tr></thead>
      <tbody>
        ${it3b.foreign_interest.length === 0 && it3b.foreign_dividends.length === 0 ? '<tr><td colspan="5" class="small">No foreign income recorded.</td></tr>' : ''}
        ${it3b.foreign_interest
          .map(
            (f) =>
              `<tr><td>${escapeHtml(f.source)}</td><td>Interest</td><td class="num">${fmtZAR(f.amount_zar)}</td><td class="num">${f.foreign_amount ? `${escapeHtml(f.foreign_currency ?? '')} ${f.foreign_amount.toLocaleString()}` : '—'}</td><td class="num">—</td></tr>`,
          )
          .join('')}
        ${it3b.foreign_dividends
          .map(
            (f) =>
              `<tr><td>${escapeHtml(f.source)}</td><td>Dividend</td><td class="num">${fmtZAR(f.amount_zar)}</td><td class="num">—</td><td class="num">${fmtZAR(f.foreign_tax_credit ?? 0)}</td></tr>`,
          )
          .join('')}
        <tr class="totals-row"><td colspan="2">Total foreign income</td><td class="num">${fmtZAR(foreignInterestTotal + foreignDivTotal)}</td><td class="num"></td><td class="num"></td></tr>
      </tbody>
    </table>

    <h2>2. IT3(c) — Capital Gains &amp; Losses</h2>
    <table>
      <thead><tr><th>Instrument</th><th>Disposal date</th><th class="num">Held (days)</th><th class="num">Proceeds</th><th class="num">Base cost</th><th class="num">Gain/Loss</th></tr></thead>
      <tbody>
        ${it3c.length === 0 ? '<tr><td colspan="6" class="small">No disposals recorded.</td></tr>' : ''}
        ${it3c
          .map(
            (c) =>
              `<tr><td>${escapeHtml(c.instrument)}</td><td>${escapeHtml(c.disposal_date)}</td><td class="num">${c.holding_period_days}</td><td class="num">${fmtZAR(c.proceeds)}</td><td class="num">${fmtZAR(c.base_cost)}</td><td class="num">${fmtZAR(c.gain_or_loss)}</td></tr>`,
          )
          .join('')}
        <tr class="totals-row"><td colspan="3">Net gain/(loss) — before annual exclusion (R40,000)</td><td class="num">${fmtZAR(cgtGains)}</td><td class="num">${fmtZAR(cgtLosses)}</td><td class="num">${fmtZAR(cgtNet)}</td></tr>
      </tbody>
    </table>
    <p class="small">Individuals: 40% inclusion rate. Effective top marginal rate ≈ 18%. Practitioner to apply R40,000 annual exclusion and aggregate with other CGT events.</p>

    <h2>3. IT3(s) — Tax-Free Savings Account</h2>
    <table>
      <tr><td>Contributions this tax year</td><td class="num">${fmtZAR(it3s.contributions_this_year)}</td></tr>
      <tr><td>Contributions lifetime</td><td class="num">${fmtZAR(it3s.contributions_lifetime)}</td></tr>
      <tr><td>Interest earned (tax-free)</td><td class="num">${fmtZAR(it3s.interest_in_tfsa)}</td></tr>
      <tr><td>Dividends earned (tax-free)</td><td class="num">${fmtZAR(it3s.dividends_in_tfsa)}</td></tr>
      <tr><td>Capital growth (tax-free)</td><td class="num">${fmtZAR(it3s.capital_growth_in_tfsa)}</td></tr>
    </table>
    ${it3s.over_contribution_warning ? `<div class="warning">${escapeHtml(it3s.over_contribution_warning)}</div>` : ''}

    <h2>4. Retirement Fund Contributions (s11F)</h2>
    <table>
      <thead><tr><th>Fund</th><th>Type</th><th>IRP5 code</th><th class="num">This year</th></tr></thead>
      <tbody>
        ${retirement_contributions.length === 0 ? '<tr><td colspan="4" class="small">No retirement fund contributions recorded.</td></tr>' : ''}
        ${retirement_contributions
          .map(
            (r) =>
              `<tr><td>${escapeHtml(r.fund_name)}</td><td>${escapeHtml(r.fund_type)}</td><td>${escapeHtml(r.irp5_code_4006_or_4001 ?? '')}</td><td class="num">${fmtZAR(r.contributions_this_year)}</td></tr>`,
          )
          .join('')}
        <tr class="totals-row"><td colspan="3">Total retirement contributions</td><td class="num">${fmtZAR(raTotal)}</td></tr>
      </tbody>
    </table>
    <p class="small">Deductible up to lesser of 27.5% of remuneration / taxable income or R350,000 per year. Excess carries forward.</p>

    <h2>5. Section 18A Donations</h2>
    <table>
      <thead><tr><th>PBO</th><th>PBO number</th><th>Receipt ref</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${s18a_donations.length === 0 ? '<tr><td colspan="4" class="small">No s18A donations recorded.</td></tr>' : ''}
        ${s18a_donations
          .map(
            (d) =>
              `<tr><td>${escapeHtml(d.pbo_name)}</td><td>${escapeHtml(d.pbo_number)}</td><td>${escapeHtml(d.receipt_ref ?? '')}</td><td class="num">${fmtZAR(d.amount)}</td></tr>`,
          )
          .join('')}
        <tr class="totals-row"><td colspan="3">Total donations</td><td class="num">${fmtZAR(donationsTotal)}</td></tr>
      </tbody>
    </table>
    <p class="small">Deductible up to 10% of taxable income. Surplus rolls over to next year.</p>

    <h2>6. ITR12 Mapping (practitioner reference)</h2>
    <table>
      <thead><tr><th>Item</th><th>Where it goes on ITR12</th></tr></thead>
      <tbody>
        ${itr12Map.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}
      </tbody>
    </table>

    ${input.advisor_notes ? `<h2>7. Advisor Notes</h2><div class="callout">${escapeHtml(input.advisor_notes)}</div>` : ''}
  `;

  return pageWrap({ ...ctx, reportTitle: `Personal Tax Pack — ${taxYear}` }, body);
}
