import { ReportContext, escapeHtml, fmtZAR, fmtPct, pageWrap } from './_layout';

export interface AnnualReviewInput {
  ctx: ReportContext;
  period_label: string; // e.g. 'Mar 2024 – Feb 2025'
  portfolio_summary: Array<{
    portfolio_name: string;
    opening_value: number;
    contributions: number;
    withdrawals: number;
    growth: number;
    closing_value: number;
    return_pct: number;
  }>;
  goals_progress: Array<{
    goal: string;
    target: number;
    current: number;
    on_track: boolean;
    notes?: string;
  }>;
  changes_in_circumstances: string;
  rebalancing_actions: string;
  outlook_next_period: string;
  recommended_actions: string[];
}

export function buildAnnualReview(input: AnnualReviewInput): string {
  const { ctx } = input;
  const portfolios = input.portfolio_summary
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.portfolio_name)}</td>
        <td class="num">${fmtZAR(p.opening_value)}</td>
        <td class="num">${fmtZAR(p.contributions)}</td>
        <td class="num">${fmtZAR(p.withdrawals)}</td>
        <td class="num">${fmtZAR(p.growth)}</td>
        <td class="num">${fmtZAR(p.closing_value)}</td>
        <td class="num">${fmtPct(p.return_pct)}</td>
      </tr>`,
    )
    .join('');

  const totals = input.portfolio_summary.reduce(
    (a, p) => ({
      opening: a.opening + p.opening_value,
      contributions: a.contributions + p.contributions,
      withdrawals: a.withdrawals + p.withdrawals,
      growth: a.growth + p.growth,
      closing: a.closing + p.closing_value,
    }),
    { opening: 0, contributions: 0, withdrawals: 0, growth: 0, closing: 0 },
  );

  const goals = input.goals_progress
    .map(
      (g) => `<tr>
        <td>${escapeHtml(g.goal)}</td>
        <td class="num">${fmtZAR(g.target)}</td>
        <td class="num">${fmtZAR(g.current)}</td>
        <td><span class="pill ${g.on_track ? 'pill-ok' : 'pill-warn'}">${g.on_track ? 'On track' : 'Behind'}</span></td>
        <td>${escapeHtml(g.notes ?? '')}</td>
      </tr>`,
    )
    .join('');

  const body = `
    <h2>1. Period Under Review</h2>
    <p>${escapeHtml(input.period_label)}</p>

    <h2>2. Portfolio Performance</h2>
    <table>
      <thead><tr><th>Portfolio</th><th class="num">Opening</th><th class="num">Contributions</th><th class="num">Withdrawals</th><th class="num">Growth</th><th class="num">Closing</th><th class="num">Return</th></tr></thead>
      <tbody>
        ${portfolios || '<tr><td colspan="7" class="small">No portfolios.</td></tr>'}
        <tr class="totals-row">
          <td>Total</td>
          <td class="num">${fmtZAR(totals.opening)}</td>
          <td class="num">${fmtZAR(totals.contributions)}</td>
          <td class="num">${fmtZAR(totals.withdrawals)}</td>
          <td class="num">${fmtZAR(totals.growth)}</td>
          <td class="num">${fmtZAR(totals.closing)}</td>
          <td class="num"></td>
        </tr>
      </tbody>
    </table>

    <h2>3. Progress Against Goals</h2>
    <table>
      <thead><tr><th>Goal</th><th class="num">Target</th><th class="num">Current</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>${goals || '<tr><td colspan="5" class="small">No goals captured.</td></tr>'}</tbody>
    </table>

    <h2>4. Changes in Circumstances</h2>
    <p>${escapeHtml(input.changes_in_circumstances)}</p>

    <h2>5. Rebalancing &amp; Actions Taken</h2>
    <p>${escapeHtml(input.rebalancing_actions)}</p>

    <h2>6. Outlook for Next Period</h2>
    <p>${escapeHtml(input.outlook_next_period)}</p>

    <h2>7. Recommended Actions</h2>
    <ul>
      ${input.recommended_actions.length === 0 ? '<li class="small">None</li>' : input.recommended_actions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}
    </ul>
  `;
  return pageWrap({ ...ctx, reportTitle: 'Annual Review' }, body);
}
