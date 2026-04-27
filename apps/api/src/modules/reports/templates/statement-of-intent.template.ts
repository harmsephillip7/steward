import { ReportContext, escapeHtml, pageWrap } from './_layout';

export interface StatementOfIntentInput {
  ctx: ReportContext;
  scope_of_engagement: string;
  services_to_be_provided: string[];
  fees_basis: string;
  exclusions: string;
  duration_and_termination: string;
}

export function buildStatementOfIntent(input: StatementOfIntentInput): string {
  const { ctx } = input;
  const body = `
    <h2>Scope of Engagement</h2>
    <p>${escapeHtml(input.scope_of_engagement)}</p>

    <h2>Services to be Provided</h2>
    <ul>${input.services_to_be_provided.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>

    <h2>Fees Basis</h2>
    <p>${escapeHtml(input.fees_basis)}</p>

    <h2>Exclusions</h2>
    <p>${escapeHtml(input.exclusions)}</p>

    <h2>Duration &amp; Termination</h2>
    <p>${escapeHtml(input.duration_and_termination)}</p>
  `;
  return pageWrap({ ...ctx, reportTitle: 'Statement of Intent' }, body);
}
