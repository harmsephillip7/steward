import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as pdfParseLib from 'pdf-parse';
const pdfParse = (pdfParseLib as any).default ?? pdfParseLib;
import { BudgetStatement, AccountType, Transaction } from './entities/budget-statement.entity';
import { BudgetAnalysis, BlueprintCategory } from './entities/budget-analysis.entity';
import {
  BIBLICAL_BLUEPRINT,
  CATEGORY_KEYS,
  TRANSACTION_CATEGORISATION_SYSTEM,
  ANALYSIS_SYSTEM_PROMPT,
} from './biblical-blueprint';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);
  private openai: OpenAI | null = null;

  constructor(
    @InjectRepository(BudgetStatement)
    private readonly statementRepo: Repository<BudgetStatement>,
    @InjectRepository(BudgetAnalysis)
    private readonly analysisRepo: Repository<BudgetAnalysis>,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not set — budget AI analysis disabled');
    }
  }

  // ── Upload & Parse ────────────────────────────────────────────

  async uploadStatement(
    clientId: string,
    file: Express.Multer.File,
    statementMonth: string,
    accountType: AccountType,
  ): Promise<BudgetStatement> {
    if (!file) throw new BadRequestException('No file provided');

    const ext = file.originalname.toLowerCase();
    let rawText = '';

    if (ext.endsWith('.pdf')) {
      const parsed = await pdfParse(file.buffer);
      rawText = parsed.text;
    } else if (ext.endsWith('.csv') || ext.endsWith('.txt')) {
      rawText = file.buffer.toString('utf-8');
    } else {
      throw new BadRequestException('Only PDF, CSV, or TXT bank statements are supported');
    }

    // Categorise transactions with AI (or fallback to empty array)
    const transactions = await this.categoriseTransactions(rawText);

    // Remove any existing statement for this client + month
    await this.statementRepo.delete({ client_id: clientId, statement_month: statementMonth });

    const stmt = this.statementRepo.create({
      client_id: clientId,
      filename: file.originalname,
      statement_month: statementMonth,
      account_type: accountType,
      transactions,
    });

    return this.statementRepo.save(stmt);
  }

  // ── AI: Transaction Categorisation ──────────────────────────

  private async categoriseTransactions(rawText: string): Promise<Transaction[]> {
    const lines = this.extractTransactionLines(rawText);
    if (lines.length === 0) return [];
    if (!this.openai) return this.fallbackCategorise(lines);

    try {
      // Chunk to avoid token limits — 200 lines per call
      const chunks: string[][] = [];
      for (let i = 0; i < lines.length; i += 200) {
        chunks.push(lines.slice(i, i + 200));
      }

      const allTransactions: Transaction[] = [];
      for (const chunk of chunks) {
        const prompt = chunk.map((l, i) => `${i + 1}. ${l}`).join('\n');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: TRANSACTION_CATEGORISATION_SYSTEM },
            {
              role: 'user',
              content: `Categorise these ${chunk.length} transactions:\n${prompt}\n\nRespond with JSON: {"categories": ["cat1","cat2",...]}`,
            },
          ],
        });

        const content = response.choices[0].message.content ?? '{}';
        const parsed = JSON.parse(content);
        const categories: string[] = parsed.categories ?? [];

        chunk.forEach((line, i) => {
          const tx = this.parseTransactionLine(line);
          if (tx) {
            tx.category = categories[i] ?? 'other';
            allTransactions.push(tx);
          }
        });
      }

      return allTransactions;
    } catch (err) {
      this.logger.error('Transaction categorisation failed', err);
      return this.fallbackCategorise(lines);
    }
  }

  /** Extract candidate transaction lines from raw text */
  private extractTransactionLines(text: string): string[] {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    // Keep lines that look like transactions: contain a number and at least some text
    return lines.filter(line => {
      const hasAmount = /\d[\d\s.,]*\d/.test(line);
      const hasText = line.length > 8;
      const isHeader = /^(date|description|debit|credit|balance|ref)/i.test(line);
      return hasAmount && hasText && !isHeader;
    });
  }

  /** Parse a raw transaction line into a structured Transaction */
  private parseTransactionLine(line: string): Transaction | null {
    // Try to extract an amount (ZAR value)
    const amountMatch = line.match(/(-?\d[\d\s]*[.,]\d{2})/);
    if (!amountMatch) return null;

    const amountStr = amountMatch[1].replace(/\s/g, '').replace(',', '.');
    const amount = Math.abs(parseFloat(amountStr));
    if (isNaN(amount) || amount === 0) return null;

    // Try to extract a date
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : '';

    // Description is whatever remains after removing date and amount
    let description = line
      .replace(dateMatch?.[0] ?? '', '')
      .replace(amountMatch[0], '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!description) description = line.slice(0, 50);

    // Heuristic: if the line starts with a negative or has "debit" keyword → debit
    const isDebit = parseFloat(amountStr) < 0 ||
      /debit|dr\b|payment|purchase/i.test(line);

    return {
      date,
      description: description.slice(0, 100),
      amount,
      type: isDebit ? 'debit' : 'credit',
      category: 'other',
    };
  }

  /** Fallback when OpenAI is not configured */
  private fallbackCategorise(lines: string[]): Transaction[] {
    return lines
      .map(l => this.parseTransactionLine(l))
      .filter((t): t is Transaction => t !== null)
      .map(t => ({ ...t, category: 'other' }));
  }

  // ── Analysis ─────────────────────────────────────────────────

  async analyseStatements(clientId: string): Promise<BudgetAnalysis> {
    // Get the 3 most recent statements
    const statements = await this.statementRepo.find({
      where: { client_id: clientId },
      order: { statement_month: 'DESC' },
    });

    if (statements.length === 0) {
      throw new BadRequestException('No statements uploaded yet');
    }

    const recent = statements.slice(0, 3);

    // Aggregate all transactions across months
    const allTx: Transaction[] = recent.flatMap(s => s.transactions);

    // Compute per-month sums, then average across months
    const monthCount = recent.length;
    const categoryTotals: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of allTx) {
      const cat = tx.category ?? 'other';
      if (tx.type === 'credit' && cat === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'debit') {
        totalExpenses += tx.amount;
        categoryTotals[cat] = (categoryTotals[cat] ?? 0) + tx.amount;
      }
    }

    const avgIncome = totalIncome / monthCount;
    const avgExpenses = totalExpenses / monthCount;
    const monthlyAverages: Record<string, number> = {};
    for (const [cat, total] of Object.entries(categoryTotals)) {
      monthlyAverages[cat] = Math.round((total / monthCount) * 100) / 100;
    }

    // Compare to blueprint (as % of income, or expenses if income = 0)
    const base = avgIncome > 0 ? avgIncome : avgExpenses;
    const blueprintComparison: Record<string, BlueprintCategory> = {};

    for (const [key, entry] of Object.entries(BIBLICAL_BLUEPRINT)) {
      const actual = monthlyAverages[key] ?? 0;
      const actual_pct = base > 0 ? Math.round((actual / base) * 1000) / 10 : 0;
      const target_pct = entry.target_pct;
      const variance_pct = Math.round((actual_pct - target_pct) * 10) / 10;
      const TOLERANCE = 2; // within ±2% is considered on_track
      const status: 'on_track' | 'over' | 'under' =
        Math.abs(variance_pct) <= TOLERANCE ? 'on_track' : variance_pct > 0 ? 'over' : 'under';

      blueprintComparison[key] = { actual_amount: actual, actual_pct, target_pct, variance_pct, status };
    }

    // Generate AI score + insights
    const { score, score_label, strengths, overspending_areas, ai_advice } =
      await this.generateInsights(avgIncome, avgExpenses, monthlyAverages, blueprintComparison);

    // Upsert (one record per client)
    const existing = await this.analysisRepo.findOne({ where: { client_id: clientId } });
    const record = existing ?? this.analysisRepo.create({ client_id: clientId });

    record.monthly_averages = monthlyAverages;
    record.total_income_avg = avgIncome;
    record.total_expenses_avg = avgExpenses;
    record.blueprint_comparison = blueprintComparison;
    record.score = score;
    record.score_label = score_label;
    record.strengths = strengths;
    record.overspending_areas = overspending_areas;
    record.ai_advice = ai_advice;
    record.statements_analysed = monthCount;
    record.streak_months = monthCount;

    return this.analysisRepo.save(record);
  }

  private async generateInsights(
    avgIncome: number,
    avgExpenses: number,
    monthlyAverages: Record<string, number>,
    blueprintComparison: Record<string, BlueprintCategory>,
  ) {
    // Default rule-based fallback
    const overspending = Object.entries(blueprintComparison)
      .filter(([, v]) => v.status === 'over')
      .map(([k]) => BIBLICAL_BLUEPRINT[k]?.label ?? k);

    const strengths = Object.entries(blueprintComparison)
      .filter(([, v]) => v.status === 'on_track' && v.actual_amount > 0)
      .map(([k]) => `${BIBLICAL_BLUEPRINT[k]?.label ?? k} is within your target`);

    const overCount = overspending.length;
    const givingOk = (blueprintComparison.giving?.status ?? 'under') !== 'under';
    const savingOk = (blueprintComparison.saving?.status ?? 'under') !== 'under';

    let score = 100 - overCount * 8;
    if (!givingOk) score -= 10;
    if (!savingOk) score -= 12;
    score = Math.max(0, Math.min(100, score));

    const score_label =
      score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

    if (!this.openai) {
      return {
        score,
        score_label,
        strengths: strengths.slice(0, 3),
        overspending_areas: overspending.slice(0, 4).map(cat => `Overspending on ${cat}`),
        ai_advice:
          'Upload your bank statements and run the analysis to receive personalised stewardship advice.',
      };
    }

    try {
      const summaryLines = Object.entries(blueprintComparison)
        .map(
          ([k, v]) =>
            `${BIBLICAL_BLUEPRINT[k]?.label ?? k}: R${v.actual_amount.toFixed(0)}/mo (${v.actual_pct}% actual vs ${v.target_pct}% target — ${v.status})`,
        )
        .join('\n');

      const prompt = [
        `Monthly income average: R${avgIncome.toFixed(0)}`,
        `Monthly expenses average: R${avgExpenses.toFixed(0)}`,
        '',
        'Category breakdown vs Biblical Blueprint:',
        summaryLines,
      ].join('\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      });

      const content = response.choices[0].message.content ?? '{}';
      const result = JSON.parse(content);

      return {
        score: typeof result.score === 'number' ? Math.max(0, Math.min(100, result.score)) : score,
        score_label: result.score_label ?? score_label,
        strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : strengths.slice(0, 3),
        overspending_areas: Array.isArray(result.overspending_areas)
          ? result.overspending_areas.slice(0, 4)
          : overspending.slice(0, 4).map(c => `Overspending on ${c}`),
        ai_advice: typeof result.ai_advice === 'string' ? result.ai_advice : 'Analysis complete.',
      };
    } catch (err) {
      this.logger.error('AI insights generation failed', err);
      return {
        score,
        score_label,
        strengths: strengths.slice(0, 3),
        overspending_areas: overspending.slice(0, 4).map(c => `Overspending on ${c}`),
        ai_advice: 'Analysis complete. Upload more months for deeper insights.',
      };
    }
  }

  // ── Data Access ───────────────────────────────────────────────

  async getAnalysis(clientId: string) {
    const [analysis, statements] = await Promise.all([
      this.analysisRepo.findOne({ where: { client_id: clientId } }),
      this.statementRepo.find({
        where: { client_id: clientId },
        order: { statement_month: 'DESC' },
        select: ['id', 'filename', 'statement_month', 'account_type', 'created_at'],
      }),
    ]);
    return { analysis, statements, blueprint: BIBLICAL_BLUEPRINT };
  }

  async deleteStatement(clientId: string, statementId: string) {
    const stmt = await this.statementRepo.findOne({ where: { id: statementId, client_id: clientId } });
    if (!stmt) throw new NotFoundException('Statement not found');
    await this.statementRepo.remove(stmt);
    return { success: true };
  }

  async toggleAdvisorVisibility(clientId: string) {
    let record = await this.analysisRepo.findOne({ where: { client_id: clientId } });
    if (!record) {
      // Create a skeleton record just to store the preference
      record = this.analysisRepo.create({ client_id: clientId, is_shared_with_advisor: false });
    } else {
      record.is_shared_with_advisor = !record.is_shared_with_advisor;
    }
    const saved = await this.analysisRepo.save(record);
    return { is_shared_with_advisor: saved.is_shared_with_advisor };
  }

  /** Advisor-side read — respects the client's privacy setting */
  async getAnalysisForAdvisor(advisorClientId: string) {
    const analysis = await this.analysisRepo.findOne({ where: { client_id: advisorClientId } });
    if (!analysis) return null;
    if (!analysis.is_shared_with_advisor) {
      throw new ForbiddenException('Client has made their budget private');
    }
    const statements = await this.statementRepo.find({
      where: { client_id: advisorClientId },
      order: { statement_month: 'DESC' },
      select: ['id', 'filename', 'statement_month', 'account_type', 'created_at'],
    });
    return { analysis, statements, blueprint: BIBLICAL_BLUEPRINT };
  }
}
