import { ReportContext, escapeHtml, fmtZAR, fmtPct, pageWrap } from './_layout';

export interface ReplacementCompareSide {
  product_name: string;
  product_provider: string;
  current_value?: number;
  contributions_to_date?: number;
  surrender_value?: number;
  ongoing_fees_pct?: number;
  initial_fees_pct?: number;
  guarantees?: string;
  benefits?: string;
  exclusions?: string;
  estimated_maturity?: number;
  loyalty_bonuses_lost?: number;
}

export interface ReplacementInput {
  ctx: ReportContext;
  /** FAIS s8(1)(d) requires comparison and reasoning. */
  existing: ReplacementCompareSide;
  proposed: ReplacementCompareSide;
  reason_for_replacement: string;
  client_advised_of_consequences: boolean;
  cooling_off_explained: boolean;
  cost_savings_or_loss: number; // negative if client loses
  break_even_years?: number;
  net_benefit_assessment: string;
}

function row(label: string, l: any, r: any): string {
  return `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(l ?? '—')}</td><td>${escapeHtml(r ?? '—')}</td></tr>`;
}

export function buildReplacement(input: ReplacementInput): string {
  const { ctx, existing, proposed } = input;

  const body = `
    <div class="warning">
      <strong>Replacement Comparison Schedule (FAIS s8(1)(d))</strong><br/>
      This document compares an existing financial product with the proposed replacement. The advisor has
      satisfied themselves that the replacement is in the client's best interest having regard to the costs,
      risks, benefits and consequences of the replacement.
    </div>

    <h2>Side-by-Side Comparison</h2>
    <table>
      <thead><tr><th>Feature</th><th>Existing</th><th>Proposed</th></tr></thead>
      <tbody>
        ${row('Product', existing.product_name, proposed.product_name)}
        ${row('Provider', existing.product_provider, proposed.product_provider)}
        ${row('Current value', existing.current_value !== undefined ? fmtZAR(existing.current_value) : '—', proposed.current_value !== undefined ? fmtZAR(proposed.current_value) : '—')}
        ${row('Surrender value', existing.surrender_value !== undefined ? fmtZAR(existing.surrender_value) : '—', '—')}
        ${row('Initial fees', existing.initial_fees_pct !== undefined ? fmtPct(existing.initial_fees_pct) : '—', proposed.initial_fees_pct !== undefined ? fmtPct(proposed.initial_fees_pct) : '—')}
        ${row('Ongoing fees', existing.ongoing_fees_pct !== undefined ? fmtPct(existing.ongoing_fees_pct) : '—', proposed.ongoing_fees_pct !== undefined ? fmtPct(proposed.ongoing_fees_pct) : '—')}
        ${row('Guarantees', existing.guarantees, proposed.guarantees)}
        ${row('Benefits', existing.benefits, proposed.benefits)}
        ${row('Exclusions / Waiting periods', existing.exclusions, proposed.exclusions)}
        ${row('Estimated maturity / outcome', existing.estimated_maturity !== undefined ? fmtZAR(existing.estimated_maturity) : '—', proposed.estimated_maturity !== undefined ? fmtZAR(proposed.estimated_maturity) : '—')}
        ${row('Loyalty / bonuses lost on replacement', existing.loyalty_bonuses_lost !== undefined ? fmtZAR(existing.loyalty_bonuses_lost) : '—', '—')}
      </tbody>
    </table>

    <h2>Reason for Replacement</h2>
    <p>${escapeHtml(input.reason_for_replacement)}</p>

    <h2>Net Effect</h2>
    <table>
      <tr><td>Estimated cost saving / (loss) of replacement</td><td class="num">${fmtZAR(input.cost_savings_or_loss)}</td></tr>
      ${input.break_even_years !== undefined ? `<tr><td>Break-even period</td><td class="num">${input.break_even_years.toFixed(1)} years</td></tr>` : ''}
    </table>

    <h2>Advisor Assessment</h2>
    <p>${escapeHtml(input.net_benefit_assessment)}</p>

    <h2>Acknowledgements</h2>
    <ul>
      <li>Client advised of consequences: <strong>${input.client_advised_of_consequences ? 'YES' : 'NO'}</strong></li>
      <li>Cooling-off period explained: <strong>${input.cooling_off_explained ? 'YES' : 'NO'}</strong></li>
    </ul>
  `;
  return pageWrap({ ...ctx, reportTitle: 'Replacement Comparison' }, body);
}
