/**
 * Shared layout helpers for all report templates.
 * Returns standard <head> styles, header, and footer so each template
 * focuses on its unique body content.
 */

export interface ReportBranding {
  firmName: string;
  fspNumber?: string;
  primaryColour?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  physicalAddress?: string;
}

export interface ReportContext {
  advisorName: string;
  advisorEmail?: string;
  advisorRepNumber?: string;
  branding: ReportBranding;
  clientName: string;
  reportTitle: string;
  reportDate: string;
  reportRef: string;
}

export function escapeHtml(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fmtZAR(amount: number | null | undefined): string {
  const n = Number(amount) || 0;
  return `R\u00a0${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(pct: number | null | undefined, dp = 2): string {
  const n = Number(pct) || 0;
  return `${n.toFixed(dp)}%`;
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function styles(colour: string): string {
  return `
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; margin: 0; padding: 0; font-size: 11pt; line-height: 1.5; }
    .doc { padding: 0; }
    .header { border-bottom: 3px solid ${colour}; padding-bottom: 16px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
    .firm-block .firm { font-size: 18pt; font-weight: 700; color: ${colour}; }
    .firm-block .fsp { font-size: 9pt; color: #6b7280; margin-top: 2px; }
    .firm-block .contact { font-size: 9pt; color: #6b7280; margin-top: 4px; }
    .ref-block { text-align: right; font-size: 9pt; color: #6b7280; }
    .ref-block .ref { font-weight: 600; color: #111827; }
    h1 { color: ${colour}; font-size: 18pt; margin: 0 0 8px; }
    h2 { color: ${colour}; font-size: 13pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 24px 0 12px; }
    h3 { font-size: 11pt; margin: 16px 0 6px; color: #111827; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 10pt; margin-bottom: 24px; }
    .meta-grid .k { color: #6b7280; }
    .meta-grid .v { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10pt; }
    th { background: ${colour}; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .totals-row td { font-weight: 700; background: #f9fafb; border-top: 2px solid ${colour}; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9pt; font-weight: 600; }
    .pill-ok { background: #dcfce7; color: #166534; }
    .pill-warn { background: #fef3c7; color: #92400e; }
    .pill-bad { background: #fee2e2; color: #991b1b; }
    .callout { background: #f9fafb; border-left: 4px solid ${colour}; padding: 12px 16px; margin: 16px 0; font-size: 10pt; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; font-size: 10pt; }
    .signature-box { margin-top: 32px; border-top: 1px dashed #9ca3af; padding-top: 16px; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
    .sig-line { border-bottom: 1px solid #111827; height: 32px; margin-bottom: 4px; }
    .sig-label { font-size: 9pt; color: #6b7280; }
    .footer-disc { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 8pt; color: #6b7280; line-height: 1.4; }
    .small { font-size: 9pt; color: #6b7280; }
    .page-break { page-break-after: always; }
  `;
}

export function header(ctx: ReportContext): string {
  const colour = ctx.branding.primaryColour ?? '#003B43';
  return `
  <div class="header">
    <div class="firm-block">
      ${ctx.branding.logoUrl ? `<img src="${escapeHtml(ctx.branding.logoUrl)}" style="max-height:50px;margin-bottom:8px" />` : ''}
      <div class="firm">${escapeHtml(ctx.branding.firmName)}</div>
      ${ctx.branding.fspNumber ? `<div class="fsp">FSP No: ${escapeHtml(ctx.branding.fspNumber)}</div>` : ''}
      <div class="contact">
        ${ctx.branding.contactEmail ? escapeHtml(ctx.branding.contactEmail) : ''}
        ${ctx.branding.contactEmail && ctx.branding.contactPhone ? ' · ' : ''}
        ${ctx.branding.contactPhone ? escapeHtml(ctx.branding.contactPhone) : ''}
      </div>
    </div>
    <div class="ref-block">
      <div>Reference</div>
      <div class="ref">${escapeHtml(ctx.reportRef)}</div>
      <div style="margin-top:4px">${escapeHtml(ctx.reportDate)}</div>
    </div>
  </div>`;
}

export function metaGrid(ctx: ReportContext, extras: Array<[string, string]> = []): string {
  const rows: Array<[string, string]> = [
    ['Client', ctx.clientName],
    ['Advisor', ctx.advisorName + (ctx.advisorRepNumber ? ` (Rep #${ctx.advisorRepNumber})` : '')],
    ['Date', ctx.reportDate],
    ['Reference', ctx.reportRef],
    ...extras,
  ];
  return `<div class="meta-grid">${rows
    .map(([k, v]) => `<div><span class="k">${escapeHtml(k)}:</span> <span class="v">${escapeHtml(v)}</span></div>`)
    .join('')}</div>`;
}

export function disclaimer(ctx: ReportContext, extra?: string): string {
  return `<div class="footer-disc">
    <strong>${escapeHtml(ctx.branding.firmName)}</strong>${ctx.branding.fspNumber ? ` (FSP ${escapeHtml(ctx.branding.fspNumber)})` : ''}
    is an authorised financial services provider in terms of the Financial Advisory and Intermediary Services Act, 2002 (FAIS).
    This document is prepared in line with section 9 of the General Code of Conduct for Authorised FSPs and Representatives.
    Past performance is not a reliable indicator of future returns. All product values are estimates.
    ${extra ? `<br/><br/>${extra}` : ''}
  </div>`;
}

export function pageWrap(ctx: ReportContext, body: string): string {
  const colour = ctx.branding.primaryColour ?? '#003B43';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${escapeHtml(ctx.reportTitle)}</title><style>${styles(colour)}</style></head><body><div class="doc">${header(ctx)}<h1>${escapeHtml(ctx.reportTitle)}</h1>${metaGrid(ctx)}${body}${disclaimer(ctx)}</div></body></html>`;
}
