/** Re-export of the legacy portfolio screening report wrapped in the new layout. */
import { ReportContext, escapeHtml, fmtPct, pageWrap } from './_layout';

export interface PortfolioScreeningInput {
  ctx: ReportContext;
  mode: string;
  clean_pct: number;
  compromised_pct: number;
  by_category: Array<{ category: string; exposure_pct: number; affected_funds_count: number }>;
}

export function buildPortfolioScreening(input: PortfolioScreeningInput): string {
  const { ctx } = input;
  const cats = input.by_category
    .map(
      (c) =>
        `<tr><td style="text-transform:capitalize">${escapeHtml(c.category)}</td><td class="num">${fmtPct(c.exposure_pct)}</td><td class="num">${c.affected_funds_count}</td></tr>`,
    )
    .join('');
  const body = `
    <p><strong>Methodology:</strong> ${escapeHtml(input.mode)}</p>
    <table>
      <tr><th>Category</th><th class="num">Exposure</th><th class="num">Funds affected</th></tr>
      ${cats || '<tr><td colspan="3" class="small">No categories.</td></tr>'}
    </table>
    <div class="callout">
      <strong>Clean:</strong> ${fmtPct(input.clean_pct, 1)} &nbsp;
      <strong>Compromised:</strong> ${fmtPct(input.compromised_pct, 1)}
    </div>
  `;
  return pageWrap({ ...ctx, reportTitle: 'Portfolio Screening Report' }, body);
}
