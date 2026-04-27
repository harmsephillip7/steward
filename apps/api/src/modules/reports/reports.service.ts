import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportType, ReportStatus } from './entities/report.entity';
import { Client } from '../clients/entities/client.entity';
import { Advisor } from '../advisors/entities/advisor.entity';
import { AuditService } from '../audit/audit.service';
import { StorageService } from '../../common/storage.service';
import { PdfService } from '../../common/pdf.service';
import { ReportContext } from './templates/_layout';
import { buildRoa, RoaInput } from './templates/roa.template';
import { buildTaxPack, TaxPackInput } from './templates/tax-pack.template';
import { buildAnnualReview, AnnualReviewInput } from './templates/annual-review.template';
import { buildReplacement, ReplacementInput } from './templates/replacement.template';
import { buildFeeDisclosure, FeeDisclosureInput } from './templates/fee-disclosure.template';
import { buildCoiDisclosure, CoiDisclosureInput } from './templates/coi.template';
import { buildFna, FnaInput } from './templates/fna.template';
import { buildStatementOfIntent, StatementOfIntentInput } from './templates/statement-of-intent.template';
import { buildPortfolioScreening, PortfolioScreeningInput } from './templates/portfolio-screening.template';

export interface GenerateReportDto {
  type: ReportType;
  client_id?: string;
  title?: string;
  payload: any;
  notes?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reports: Repository<Report>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Advisor) private readonly advisors: Repository<Advisor>,
    private readonly storage: StorageService,
    private readonly pdf: PdfService,
    private readonly audit: AuditService,
  ) {}

  /** Build the standard report context (branding + names) for an advisor + client. */
  private async buildContext(
    advisorId: string,
    clientId: string | undefined,
    title: string,
  ): Promise<{ ctx: ReportContext; client?: Client; advisor: Advisor }> {
    const advisor = await this.advisors.findOne({ where: { id: advisorId } });
    if (!advisor) throw new NotFoundException('Advisor not found');

    let client: Client | undefined;
    if (clientId) {
      client = (await this.clients.findOne({ where: { id: clientId, advisor_id: advisorId } })) ?? undefined;
      if (!client) throw new NotFoundException('Client not found');
    }

    const today = new Date();
    const ref = `STW-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const ctx: ReportContext = {
      advisorName: advisor.name,
      advisorEmail: advisor.email,
      branding: {
        firmName: advisor.firm_name,
        fspNumber: advisor.fsp_number ?? undefined,
        primaryColour: advisor.primary_colour_hex ?? '#003B43',
        logoUrl: advisor.logo_url ?? undefined,
      },
      clientName: client ? `${client.first_name} ${client.last_name}` : 'Internal',
      reportTitle: title,
      reportDate: today.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      reportRef: ref,
    };
    return { ctx, client, advisor };
  }

  private renderHtml(type: ReportType, ctx: ReportContext, payload: any): string {
    switch (type) {
      case 'roa':
        return buildRoa({ ...(payload as RoaInput), ctx });
      case 'tax_pack':
        return buildTaxPack({ ...(payload as TaxPackInput), ctx });
      case 'annual_review':
        return buildAnnualReview({ ...(payload as AnnualReviewInput), ctx });
      case 'replacement_comparison':
        return buildReplacement({ ...(payload as ReplacementInput), ctx });
      case 'fee_disclosure':
        return buildFeeDisclosure({ ...(payload as FeeDisclosureInput), ctx });
      case 'coi_disclosure':
        return buildCoiDisclosure({ ...(payload as CoiDisclosureInput), ctx });
      case 'fna':
        return buildFna({ ...(payload as FnaInput), ctx });
      case 'statement_of_intent':
        return buildStatementOfIntent({ ...(payload as StatementOfIntentInput), ctx });
      case 'portfolio_screening':
        return buildPortfolioScreening({ ...(payload as PortfolioScreeningInput), ctx });
      default:
        throw new BadRequestException(`Unknown report type: ${type}`);
    }
  }

  private titleFor(type: ReportType): string {
    const t: Record<ReportType, string> = {
      roa: 'Record of Advice',
      tax_pack: 'Personal Tax Pack',
      annual_review: 'Annual Review',
      replacement_comparison: 'Replacement Comparison',
      fee_disclosure: 'Fee Disclosure',
      coi_disclosure: 'Conflict of Interest Disclosure',
      fna: 'Financial Needs Analysis',
      statement_of_intent: 'Statement of Intent',
      portfolio_screening: 'Portfolio Screening Report',
    };
    return t[type];
  }

  async generate(advisorId: string, dto: GenerateReportDto, request?: { ip?: string; correlationId?: string }) {
    if (!dto.type) throw new BadRequestException('type required');
    const title = dto.title ?? this.titleFor(dto.type);
    const { ctx } = await this.buildContext(advisorId, dto.client_id, title);

    const html = this.renderHtml(dto.type, ctx, dto.payload || {});
    const rendered = await this.pdf.render(html);

    const key = `reports/${advisorId}/${ctx.reportRef}.${rendered.ext}`;
    const stored = await this.storage.put(key, rendered.buffer, rendered.contentType);

    const report = this.reports.create({
      advisorId,
      client_id: dto.client_id ?? null,
      type: dto.type,
      status: 'draft',
      title,
      payload: dto.payload || {},
      pdf_key: stored.key,
      pdf_url: stored.url,
      pdf_sha256: stored.sha256,
      notes: dto.notes ?? null,
    } as Partial<Report>);
    const saved = await this.reports.save(report);

    await this.audit.record({
      advisorId,
      clientId: dto.client_id,
      actorType: 'advisor',
      action: 'report.generated',
      entityType: 'report',
      entityId: saved.id,
      ipAddress: request?.ip,
      correlationId: request?.correlationId,
      after: { type: saved.type, title: saved.title, sha256: saved.pdf_sha256 },
    });

    return saved;
  }

  async finalise(advisorId: string, reportId: string, request?: { ip?: string; correlationId?: string }) {
    const r = await this.requireReport(advisorId, reportId);
    if (r.status !== 'draft') throw new BadRequestException(`Cannot finalise from ${r.status}`);
    r.status = 'finalised';
    r.finalised_at = new Date();
    const saved = await this.reports.save(r);
    await this.audit.record({
      advisorId,
      clientId: r.client_id,
      actorType: 'advisor',
      action: 'report.finalised',
      entityType: 'report',
      entityId: r.id,
      ipAddress: request?.ip,
      correlationId: request?.correlationId,
      after: { sha256: r.pdf_sha256 },
    });
    return saved;
  }

  async sendToClient(advisorId: string, reportId: string, request?: { ip?: string; correlationId?: string }) {
    const r = await this.requireReport(advisorId, reportId);
    if (r.status !== 'finalised') throw new BadRequestException('Report must be finalised before sending');
    r.status = 'sent_to_client';
    r.sent_at = new Date();
    const saved = await this.reports.save(r);
    await this.audit.record({
      advisorId,
      clientId: r.client_id,
      actorType: 'advisor',
      action: 'report.sent',
      entityType: 'report',
      entityId: r.id,
      ipAddress: request?.ip,
      correlationId: request?.correlationId,
    });
    return saved;
  }

  async list(advisorId: string, filters: { client_id?: string; type?: ReportType; status?: ReportStatus; limit?: number } = {}) {
    const qb = this.reports.createQueryBuilder('r').where('r.advisor_id = :a', { a: advisorId });
    if (filters.client_id) qb.andWhere('r.client_id = :c', { c: filters.client_id });
    if (filters.type) qb.andWhere('r.type = :t', { t: filters.type });
    if (filters.status) qb.andWhere('r.status = :s', { s: filters.status });
    qb.orderBy('r.created_at', 'DESC').limit(filters.limit ?? 100);
    return qb.getMany();
  }

  async getById(advisorId: string, reportId: string): Promise<Report> {
    return this.requireReport(advisorId, reportId);
  }

  async download(advisorId: string, reportId: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const r = await this.requireReport(advisorId, reportId);
    if (!r.pdf_key) throw new NotFoundException('No file stored');
    const buffer = await this.storage.get(r.pdf_key);
    const ext = r.pdf_key.endsWith('.pdf') ? 'pdf' : 'html';
    return {
      buffer,
      contentType: ext === 'pdf' ? 'application/pdf' : 'text/html',
      filename: `${r.title.replace(/[^a-z0-9]+/gi, '-')}.${ext}`,
    };
  }

  /** Portal-side: client accepts the advice. */
  async recordAcceptance(
    reportId: string,
    signature: { typed_name: string; ip_address?: string; user_agent?: string },
  ) {
    const r = await this.reports.findOne({ where: { id: reportId } });
    if (!r) throw new NotFoundException('Report not found');
    if (r.status !== 'sent_to_client') throw new BadRequestException(`Cannot accept from ${r.status}`);
    r.status = 'accepted';
    r.decided_at = new Date();
    r.signature = {
      typed_name: signature.typed_name,
      ipAddress: signature.ip_address,
      userAgent: signature.user_agent,
      signed_at: new Date().toISOString(),
      pdf_sha256: r.pdf_sha256,
    };
    const saved = await this.reports.save(r);
    await this.audit.record({
      advisorId: r.advisor_id,
      clientId: r.client_id,
      actorType: 'client',
      action: 'report.accepted',
      entityType: 'report',
      entityId: r.id,
      ipAddress: signature.ip_address,
      userAgent: signature.user_agent,
      after: { signature: r.signature },
    });
    return saved;
  }

  async recordDecline(reportId: string, reason: string, meta: { ip_address?: string; user_agent?: string }) {
    const r = await this.reports.findOne({ where: { id: reportId } });
    if (!r) throw new NotFoundException('Report not found');
    if (r.status !== 'sent_to_client') throw new BadRequestException(`Cannot decline from ${r.status}`);
    r.status = 'declined';
    r.decided_at = new Date();
    r.decline_reason = reason;
    const saved = await this.reports.save(r);
    await this.audit.record({
      advisorId: r.advisor_id,
      clientId: r.client_id,
      actorType: 'client',
      action: 'report.declined',
      entityType: 'report',
      entityId: r.id,
      ipAddress: meta.ip_address,
      userAgent: meta.user_agent,
      after: { reason },
    });
    return saved;
  }

  private async requireReport(advisorId: string, reportId: string): Promise<Report> {
    const r = await this.reports.findOne({ where: { id: reportId } });
    if (!r) throw new NotFoundException('Report not found');
    if (r.advisor_id !== advisorId) throw new ForbiddenException('Not your report');
    return r;
  }

  // ─── Backwards-compatible shims for the legacy single-portfolio endpoint ───

  async generatePortfolioReport(advisorId: string, body: any): Promise<{ html: string; message: string }> {
    const { ctx } = await this.buildContext(advisorId, body.client_id, body.title ?? 'Portfolio Screening Report');
    const html = buildPortfolioScreening({
      ctx,
      mode: body.screening?.mode ?? 'standard',
      clean_pct: body.screening?.clean_pct ?? 0,
      compromised_pct: body.screening?.compromised_pct ?? 0,
      by_category: body.screening?.by_category ?? [],
    });
    return { html, message: 'Use POST /reports/generate to persist + render PDF.' };
  }
}
