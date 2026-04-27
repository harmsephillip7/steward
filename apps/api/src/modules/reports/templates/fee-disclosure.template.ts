import { ReportContext, escapeHtml, fmtZAR, fmtPct, pageWrap } from './_layout';

export interface FeeDisclosureInput {
  ctx: ReportContext;
  product_name: string;
  fees: Array<{
    type: string; // initial, ongoing, performance, switch, exit
    payable_to: string; // advisor, platform, asset manager
    rate_pct?: number;
    amount?: number;
    frequency: string;
    description: string;
  }>;
  total_first_year_cost_estimate: number;
  total_first_year_cost_pct: number;
}

export function buildFeeDisclosure(input: FeeDisclosureInput): string {
  const { ctx } = input;
  const rows = input.fees
    .map(
      (f) => `<tr>
        <td>${escapeHtml(f.type)}</td>
        <td>${escapeHtml(f.payable_to)}</td>
        <td class="num">${f.rate_pct !== undefined ? fmtPct(f.rate_pct) : '—'}</td>
        <td class="num">${f.amount !== undefined ? fmtZAR(f.amount) : '—'}</td>
        <td>${escapeHtml(f.frequency)}</td>
        <td>${escapeHtml(f.description)}</td>
      </tr>`,
    )
    .join('');

  const body = `
    <p><strong>Product:</strong> ${escapeHtml(input.product_name)}</p>
    <table>
      <thead><tr><th>Fee type</th><th>Payable to</th><th class="num">Rate</th><th class="num">Amount</th><th>Frequency</th><th>Description</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6" class="small">No fees disclosed.</td></tr>'}</tbody>
    </table>
    <div class="callout">
      <strong>Estimated total cost in year 1:</strong> ${fmtZAR(input.total_first_year_cost_estimate)}
      (${fmtPct(input.total_first_year_cost_pct)} of invested amount)
    </div>
  `;
  return pageWrap({ ...ctx, reportTitle: 'Fee Disclosure' }, body);
}
