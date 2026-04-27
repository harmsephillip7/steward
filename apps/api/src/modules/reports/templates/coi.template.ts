import { ReportContext, escapeHtml, pageWrap } from './_layout';

export interface CoiDisclosureInput {
  ctx: ReportContext;
  /** Per FSCA General Code of Conduct s3A, full COI register. */
  ownership_disclosures: string;
  third_party_relationships: Array<{ counterparty: string; nature: string; mitigation: string }>;
  fees_received_from_product_suppliers: Array<{ supplier: string; basis: string; amount_or_rate: string }>;
  gifts_received_above_threshold: Array<{ from: string; description: string; value: number; date: string }>;
  shareholdings: Array<{ entity: string; pct: number }>;
  mitigation_policy_summary: string;
}

export function buildCoiDisclosure(input: CoiDisclosureInput): string {
  const { ctx } = input;
  const tprs = input.third_party_relationships
    .map((t) => `<tr><td>${escapeHtml(t.counterparty)}</td><td>${escapeHtml(t.nature)}</td><td>${escapeHtml(t.mitigation)}</td></tr>`)
    .join('');
  const fees = input.fees_received_from_product_suppliers
    .map((f) => `<tr><td>${escapeHtml(f.supplier)}</td><td>${escapeHtml(f.basis)}</td><td>${escapeHtml(f.amount_or_rate)}</td></tr>`)
    .join('');
  const gifts = input.gifts_received_above_threshold
    .map((g) => `<tr><td>${escapeHtml(g.from)}</td><td>${escapeHtml(g.description)}</td><td>${g.value}</td><td>${escapeHtml(g.date)}</td></tr>`)
    .join('');
  const shares = input.shareholdings
    .map((s) => `<tr><td>${escapeHtml(s.entity)}</td><td>${s.pct.toFixed(2)}%</td></tr>`)
    .join('');

  const body = `
    <h2>Ownership Disclosures</h2>
    <p>${escapeHtml(input.ownership_disclosures)}</p>

    <h2>Third-Party Relationships</h2>
    <table><thead><tr><th>Counterparty</th><th>Nature</th><th>Mitigation</th></tr></thead><tbody>${tprs || '<tr><td colspan="3" class="small">None disclosed.</td></tr>'}</tbody></table>

    <h2>Fees / Commissions Received from Product Suppliers</h2>
    <table><thead><tr><th>Supplier</th><th>Basis</th><th>Amount/Rate</th></tr></thead><tbody>${fees || '<tr><td colspan="3" class="small">None disclosed.</td></tr>'}</tbody></table>

    <h2>Gifts &amp; Hospitality (above threshold)</h2>
    <table><thead><tr><th>From</th><th>Description</th><th>Value</th><th>Date</th></tr></thead><tbody>${gifts || '<tr><td colspan="4" class="small">None recorded.</td></tr>'}</tbody></table>

    <h2>Material Shareholdings</h2>
    <table><thead><tr><th>Entity</th><th>%</th></tr></thead><tbody>${shares || '<tr><td colspan="2" class="small">None.</td></tr>'}</tbody></table>

    <h2>Mitigation Policy</h2>
    <p>${escapeHtml(input.mitigation_policy_summary)}</p>
  `;
  return pageWrap({ ...ctx, reportTitle: 'Conflict of Interest Disclosure' }, body);
}
