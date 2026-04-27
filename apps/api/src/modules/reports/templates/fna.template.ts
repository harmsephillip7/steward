import { ReportContext, escapeHtml, fmtZAR, pageWrap } from './_layout';

export interface FnaInput {
  ctx: ReportContext;
  retirement_gap?: { current_capital: number; required_capital: number; shortfall: number; required_monthly_contribution: number };
  life_cover?: { required: number; current: number; shortfall: number };
  disability?: { required: number; current: number; shortfall: number };
  dread_disease?: { required: number; current: number; shortfall: number };
  estate?: { gross_estate: number; estimated_estate_duty: number; estimated_executor_fees: number; liquidity_shortfall: number };
  education?: Array<{ child: string; required: number; current_savings: number; shortfall: number }>;
  tfsa?: { contributed_this_year: number; remaining_annual: number; remaining_lifetime: number };
  notes?: string;
}

export function buildFna(input: FnaInput): string {
  const { ctx } = input;

  const sections: string[] = [];

  if (input.retirement_gap) {
    const r = input.retirement_gap;
    sections.push(`
      <h2>Retirement</h2>
      <table>
        <tr><td>Current capital</td><td class="num">${fmtZAR(r.current_capital)}</td></tr>
        <tr><td>Required capital at retirement</td><td class="num">${fmtZAR(r.required_capital)}</td></tr>
        <tr><td>Shortfall</td><td class="num">${fmtZAR(r.shortfall)}</td></tr>
        <tr><td>Required monthly contribution</td><td class="num">${fmtZAR(r.required_monthly_contribution)}</td></tr>
      </table>`);
  }
  if (input.life_cover) {
    sections.push(`<h2>Life Cover</h2><table>
        <tr><td>Required</td><td class="num">${fmtZAR(input.life_cover.required)}</td></tr>
        <tr><td>Current</td><td class="num">${fmtZAR(input.life_cover.current)}</td></tr>
        <tr><td>Shortfall</td><td class="num">${fmtZAR(input.life_cover.shortfall)}</td></tr></table>`);
  }
  if (input.disability) {
    sections.push(`<h2>Disability Cover</h2><table>
        <tr><td>Required</td><td class="num">${fmtZAR(input.disability.required)}</td></tr>
        <tr><td>Current</td><td class="num">${fmtZAR(input.disability.current)}</td></tr>
        <tr><td>Shortfall</td><td class="num">${fmtZAR(input.disability.shortfall)}</td></tr></table>`);
  }
  if (input.dread_disease) {
    sections.push(`<h2>Dread Disease Cover</h2><table>
        <tr><td>Required</td><td class="num">${fmtZAR(input.dread_disease.required)}</td></tr>
        <tr><td>Current</td><td class="num">${fmtZAR(input.dread_disease.current)}</td></tr>
        <tr><td>Shortfall</td><td class="num">${fmtZAR(input.dread_disease.shortfall)}</td></tr></table>`);
  }
  if (input.estate) {
    const e = input.estate;
    sections.push(`<h2>Estate Liquidity</h2><table>
        <tr><td>Gross estate</td><td class="num">${fmtZAR(e.gross_estate)}</td></tr>
        <tr><td>Estimated estate duty</td><td class="num">${fmtZAR(e.estimated_estate_duty)}</td></tr>
        <tr><td>Estimated executor fees</td><td class="num">${fmtZAR(e.estimated_executor_fees)}</td></tr>
        <tr><td>Liquidity shortfall</td><td class="num">${fmtZAR(e.liquidity_shortfall)}</td></tr></table>`);
  }
  if (input.education && input.education.length > 0) {
    sections.push(`<h2>Education</h2><table>
        <thead><tr><th>Child</th><th class="num">Required</th><th class="num">Current</th><th class="num">Shortfall</th></tr></thead>
        <tbody>${input.education.map((c) => `<tr><td>${escapeHtml(c.child)}</td><td class="num">${fmtZAR(c.required)}</td><td class="num">${fmtZAR(c.current_savings)}</td><td class="num">${fmtZAR(c.shortfall)}</td></tr>`).join('')}</tbody></table>`);
  }
  if (input.tfsa) {
    sections.push(`<h2>Tax-Free Savings</h2><table>
        <tr><td>Contributed this tax year</td><td class="num">${fmtZAR(input.tfsa.contributed_this_year)}</td></tr>
        <tr><td>Remaining (annual)</td><td class="num">${fmtZAR(input.tfsa.remaining_annual)}</td></tr>
        <tr><td>Remaining (lifetime)</td><td class="num">${fmtZAR(input.tfsa.remaining_lifetime)}</td></tr></table>`);
  }
  if (input.notes) {
    sections.push(`<h2>Advisor Notes</h2><div class="callout">${escapeHtml(input.notes)}</div>`);
  }

  const body = sections.join('\n') || '<p class="small">No analysis sections populated.</p>';
  return pageWrap({ ...ctx, reportTitle: 'Financial Needs Analysis' }, body);
}
