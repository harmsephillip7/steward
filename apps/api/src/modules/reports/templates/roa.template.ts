import { ReportContext, escapeHtml, fmtZAR, fmtPct, pageWrap } from './_layout';

export interface RoaProductRecommended {
  product_name: string;
  product_provider: string;
  product_type: string; // RA, LISP, life policy, TFSA, ...
  premium_or_contribution?: number;
  premium_frequency?: 'monthly' | 'annual' | 'once-off';
  sum_assured?: number;
  term_years?: number;
  fees_explained: string;
  commission_disclosure: string;
  risks_disclosed: string;
  is_replacement: boolean;
  replacement_reason?: string;
}

export interface RoaInput {
  ctx: ReportContext;
  /** FAIS section 9(1)(a) — financial situation analysis. */
  client_financial_situation: string;
  /** FAIS section 9(1)(b) — needs/objectives identified. */
  client_needs_objectives: string;
  /** FAIS section 9(1)(c) — basis on which advice was given. */
  basis_of_advice: string;
  products: RoaProductRecommended[];
  /** Alternatives considered and reason for not recommending them. */
  alternatives_considered: string;
  /** Material risks the client must understand. */
  material_risks: string;
  /** Conflicts of interest disclosed. */
  conflicts_of_interest: string;
  /** Total fees & commissions, broken down. */
  fees_summary: Array<{ label: string; amount_excl_vat: number; vat: number; total: number }>;
  /** Replacement warning text if any product is a replacement. */
  contains_replacement: boolean;
  /** Optional advisor closing note. */
  advisor_note?: string;
  /** Source-of-funds and source-of-wealth declared. */
  source_of_funds?: string;
  /** Will be filled when client signs. */
  signature_block?: { client_typed_name?: string; signed_at?: string; ip_address?: string };
}

export function buildRoa(input: RoaInput): string {
  const { ctx } = input;

  const products = input.products
    .map(
      (p) => `
    <h3>${escapeHtml(p.product_name)} <span class="small">— ${escapeHtml(p.product_provider)}</span></h3>
    <table>
      <tr><th>Field</th><th>Detail</th></tr>
      <tr><td>Product type</td><td>${escapeHtml(p.product_type)}</td></tr>
      ${p.premium_or_contribution ? `<tr><td>Premium / Contribution</td><td>${fmtZAR(p.premium_or_contribution)} ${p.premium_frequency ? `(${p.premium_frequency})` : ''}</td></tr>` : ''}
      ${p.sum_assured ? `<tr><td>Sum assured</td><td>${fmtZAR(p.sum_assured)}</td></tr>` : ''}
      ${p.term_years ? `<tr><td>Term</td><td>${p.term_years} years</td></tr>` : ''}
      <tr><td>Fees explained</td><td>${escapeHtml(p.fees_explained)}</td></tr>
      <tr><td>Commission disclosure</td><td>${escapeHtml(p.commission_disclosure)}</td></tr>
      <tr><td>Risks disclosed</td><td>${escapeHtml(p.risks_disclosed)}</td></tr>
      ${p.is_replacement ? `<tr><td>Replacement</td><td><span class="pill pill-warn">YES</span> ${escapeHtml(p.replacement_reason ?? '')}</td></tr>` : ''}
    </table>`,
    )
    .join('');

  const fees = input.fees_summary
    .map(
      (f) => `<tr>
        <td>${escapeHtml(f.label)}</td>
        <td class="num">${fmtZAR(f.amount_excl_vat)}</td>
        <td class="num">${fmtZAR(f.vat)}</td>
        <td class="num">${fmtZAR(f.total)}</td>
      </tr>`,
    )
    .join('');
  const feeTotal = input.fees_summary.reduce(
    (acc, f) => ({
      excl: acc.excl + (f.amount_excl_vat || 0),
      vat: acc.vat + (f.vat || 0),
      total: acc.total + (f.total || 0),
    }),
    { excl: 0, vat: 0, total: 0 },
  );

  const replacementWarning = input.contains_replacement
    ? `<div class="warning">
        <strong>Replacement Warning (FAIS s8(1)(d))</strong><br/>
        One or more of the products recommended above replaces an existing financial product.
        Replacement may result in additional costs, loss of benefits accumulated under the existing
        product, new waiting periods or exclusions, and claw-back of commissions. The detailed
        Replacement Comparison Schedule has been provided to you separately and forms part of this
        record.
      </div>`
    : '';

  const sigName = input.signature_block?.client_typed_name ?? '';
  const sigDate = input.signature_block?.signed_at ?? '';
  const sigIp = input.signature_block?.ip_address ?? '';

  const body = `
    ${replacementWarning}

    <h2>1. Client Financial Situation</h2>
    <p>${escapeHtml(input.client_financial_situation)}</p>

    <h2>2. Needs &amp; Objectives Identified</h2>
    <p>${escapeHtml(input.client_needs_objectives)}</p>

    <h2>3. Basis of Advice</h2>
    <p>${escapeHtml(input.basis_of_advice)}</p>

    <h2>4. Products Recommended</h2>
    ${products || '<p class="small">No products recorded.</p>'}

    <h2>5. Alternatives Considered</h2>
    <p>${escapeHtml(input.alternatives_considered)}</p>

    <h2>6. Material Risks</h2>
    <p>${escapeHtml(input.material_risks)}</p>

    <h2>7. Conflicts of Interest</h2>
    <p>${escapeHtml(input.conflicts_of_interest)}</p>

    <h2>8. Fees &amp; Commissions</h2>
    <table>
      <thead><tr><th>Item</th><th class="num">Amount (excl VAT)</th><th class="num">VAT</th><th class="num">Total</th></tr></thead>
      <tbody>
        ${fees || '<tr><td colspan="4" class="small">No fees recorded.</td></tr>'}
        <tr class="totals-row">
          <td>Total</td>
          <td class="num">${fmtZAR(feeTotal.excl)}</td>
          <td class="num">${fmtZAR(feeTotal.vat)}</td>
          <td class="num">${fmtZAR(feeTotal.total)}</td>
        </tr>
      </tbody>
    </table>

    ${input.source_of_funds ? `<h2>9. Source of Funds / Wealth</h2><p>${escapeHtml(input.source_of_funds)}</p>` : ''}

    ${input.advisor_note ? `<div class="callout">${escapeHtml(input.advisor_note)}</div>` : ''}

    <div class="signature-box">
      <h2>Client Acknowledgement</h2>
      <p class="small">
        I confirm that the contents of this Record of Advice have been explained to me, that I understand
        the products recommended, the risks, the fees and commissions, and that I have had an
        opportunity to ask questions. I accept the advice given.
      </p>
      <div class="signature-grid">
        <div>
          <div class="sig-line">${escapeHtml(sigName)}</div>
          <div class="sig-label">Client typed name</div>
        </div>
        <div>
          <div class="sig-line">${escapeHtml(sigDate)}${sigIp ? ' · IP ' + escapeHtml(sigIp) : ''}</div>
          <div class="sig-label">Date / electronic signature evidence</div>
        </div>
      </div>
    </div>
  `;

  return pageWrap({ ...ctx, reportTitle: 'Record of Advice' }, body);
}
