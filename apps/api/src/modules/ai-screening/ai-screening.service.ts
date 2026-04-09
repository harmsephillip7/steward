import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { CompromiseCategory, FlagSource } from '@steward/shared';
import { Fund } from '../funds/entities/fund.entity';
import { Holding } from '../funds/entities/holding.entity';
import { CompromiseFlag } from '../funds/entities/compromise-flag.entity';
import {
  CHRISTIAN_SCREEN_SYSTEM_PROMPT,
  AiScreenResult,
  CategoryKey,
} from './christian-screen-methodology';

/** Minimum confidence to store a flag (matches the <0.30 cut-off in methodology). */
const MIN_CONFIDENCE = 0.30;

/** Delay between OpenAI calls to respect rate limits (ms). */
const RATE_LIMIT_DELAY_MS = 200;

export interface FundScreeningSummary {
  fund_id: string;
  fund_name: string;
  holdings_analysed: number;
  flags_created: number;
  flags_removed: number;
  flagged_holdings: Array<{
    company: string;
    isin?: string;
    categories: string[];
  }>;
}

export interface AllFundsScreeningSummary {
  funds_processed: number;
  total_holdings_analysed: number;
  total_flags_created: number;
  total_flags_removed: number;
  companies_cached: number;
  results: FundScreeningSummary[];
}

@Injectable()
export class AiScreeningService {
  private readonly logger = new Logger(AiScreeningService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(Fund)
    private readonly fundRepo: Repository<Fund>,
    @InjectRepository(Holding)
    private readonly holdingRepo: Repository<Holding>,
    @InjectRepository(CompromiseFlag)
    private readonly flagRepo: Repository<CompromiseFlag>,
    private readonly config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Screen all holdings in a single fund using the AI Christian screen.
   * Deletes existing AI-generated flags before re-screening so the methodology
   * can be updated and re-applied without duplicates.
   */
  async screenFund(fundId: string): Promise<FundScreeningSummary> {
    const fund = await this.fundRepo.findOne({ where: { id: fundId } });
    if (!fund) throw new NotFoundException(`Fund ${fundId} not found`);

    const holdings = await this.holdingRepo.find({
      where: { fund_id: fundId },
      relations: ['compromise_flags'],
      order: { weight_pct: 'DESC' },
    });

    this.logger.log(`Screening fund "${fund.name}" — ${holdings.length} holdings`);

    // Delete existing AI flags for this fund's holdings
    const holdingIds = holdings.map((h) => h.id);
    let flagsRemoved = 0;
    if (holdingIds.length > 0) {
      const deleted = await this.flagRepo
        .createQueryBuilder()
        .delete()
        .where('holding_id IN (:...ids)', { ids: holdingIds })
        .andWhere('flagged_by = :source', { source: FlagSource.AI })
        .execute();
      flagsRemoved = deleted.affected ?? 0;
    }

    // Classify each holding and create flags
    let flagsCreated = 0;
    const flaggedHoldings: FundScreeningSummary['flagged_holdings'] = [];

    for (const holding of holdings) {
      const result = await this.classifyCompany(
        holding.company_name,
        holding.isin ?? undefined,
        holding.sector ?? undefined,
        holding.country ?? undefined,
      );

      if (result.flags.length > 0) {
        const categories: string[] = [];
        for (const flag of result.flags) {
          if (flag.confidence >= MIN_CONFIDENCE) {
            await this.flagRepo.save(
              this.flagRepo.create({
                holding_id: holding.id,
                category: flag.category as CompromiseCategory,
                confidence_score: flag.confidence,
                flagged_by: FlagSource.AI,
                notes: flag.notes,
              }),
            );
            flagsCreated++;
            categories.push(flag.category);
          }
        }
        if (categories.length > 0) {
          flaggedHoldings.push({
            company: holding.company_name,
            isin: holding.isin ?? undefined,
            categories,
          });
        }
      }

      // Respect OpenAI rate limits
      await this.delay(RATE_LIMIT_DELAY_MS);
    }

    this.logger.log(
      `Fund "${fund.name}" complete — ${flagsCreated} flags created, ${flagsRemoved} removed`,
    );

    return {
      fund_id: fund.id,
      fund_name: fund.name,
      holdings_analysed: holdings.length,
      flags_created: flagsCreated,
      flags_removed: flagsRemoved,
      flagged_holdings: flaggedHoldings,
    };
  }

  /**
   * Screen all funds. Uses an ISIN-based cache so the same company (same ISIN)
   * appearing in multiple funds is only classified once per run.
   */
  async screenAllFunds(): Promise<AllFundsScreeningSummary> {
    const funds = await this.fundRepo.find({ order: { name: 'ASC' } });
    this.logger.log(`Starting full screen of ${funds.length} funds`);

    // ISIN → classification result cache for this run
    const cache = new Map<string, AiScreenResult>();

    let totalHoldings = 0;
    let totalFlagsCreated = 0;
    let totalFlagsRemoved = 0;
    const results: FundScreeningSummary[] = [];

    for (const fund of funds) {
      const holdings = await this.holdingRepo.find({
        where: { fund_id: fund.id },
        relations: ['compromise_flags'],
        order: { weight_pct: 'DESC' },
      });

      const holdingIds = holdings.map((h) => h.id);
      let flagsRemoved = 0;
      if (holdingIds.length > 0) {
        const deleted = await this.flagRepo
          .createQueryBuilder()
          .delete()
          .where('holding_id IN (:...ids)', { ids: holdingIds })
          .andWhere('flagged_by = :source', { source: FlagSource.AI })
          .execute();
        flagsRemoved = deleted.affected ?? 0;
      }

      let flagsCreated = 0;
      const flaggedHoldings: FundScreeningSummary['flagged_holdings'] = [];

      for (const holding of holdings) {
        // Use ISIN cache to avoid re-classifying same company
        let result: AiScreenResult;
        const cacheKey = holding.isin;

        if (cacheKey && cache.has(cacheKey)) {
          result = cache.get(cacheKey)!;
          this.logger.debug(`Cache hit for ISIN ${cacheKey} (${holding.company_name})`);
        } else {
          result = await this.classifyCompany(
            holding.company_name,
            holding.isin ?? undefined,
            holding.sector ?? undefined,
            holding.country ?? undefined,
          );
          if (cacheKey) cache.set(cacheKey, result);
          await this.delay(RATE_LIMIT_DELAY_MS);
        }

        if (result.flags.length > 0) {
          const categories: string[] = [];
          for (const flag of result.flags) {
            if (flag.confidence >= MIN_CONFIDENCE) {
              await this.flagRepo.save(
                this.flagRepo.create({
                  holding_id: holding.id,
                  category: flag.category as CompromiseCategory,
                  confidence_score: flag.confidence,
                  flagged_by: FlagSource.AI,
                  notes: flag.notes,
                }),
              );
              flagsCreated++;
              categories.push(flag.category);
            }
          }
          if (categories.length > 0) {
            flaggedHoldings.push({
              company: holding.company_name,
              isin: holding.isin ?? undefined,
              categories,
            });
          }
        }
      }

      totalHoldings += holdings.length;
      totalFlagsCreated += flagsCreated;
      totalFlagsRemoved += flagsRemoved;

      results.push({
        fund_id: fund.id,
        fund_name: fund.name,
        holdings_analysed: holdings.length,
        flags_created: flagsCreated,
        flags_removed: flagsRemoved,
        flagged_holdings: flaggedHoldings,
      });

      this.logger.log(`✓ ${fund.name} — ${flagsCreated} flags`);
    }

    this.logger.log(
      `All-funds screen complete — ${totalFlagsCreated} flags created across ${totalHoldings} holdings`,
    );

    return {
      funds_processed: funds.length,
      total_holdings_analysed: totalHoldings,
      total_flags_created: totalFlagsCreated,
      total_flags_removed: totalFlagsRemoved,
      companies_cached: cache.size,
      results,
    };
  }

  /**
   * Get current flag status across all funds — useful for a status dashboard.
   */
  async getStatus(): Promise<
    Array<{ fund_id: string; fund_name: string; ai_flags: number; manual_flags: number }>
  > {
    const funds = await this.fundRepo.find({ order: { name: 'ASC' } });
    const status: Array<{ fund_id: string; fund_name: string; ai_flags: number; manual_flags: number }> = [];

    for (const fund of funds) {
      const holdings = await this.holdingRepo.find({ where: { fund_id: fund.id } });
      const holdingIds = holdings.map((h) => h.id);

      if (holdingIds.length === 0) {
        status.push({ fund_id: fund.id, fund_name: fund.name, ai_flags: 0, manual_flags: 0 });
        continue;
      }

      const aiFlagCount = await this.flagRepo
        .createQueryBuilder('f')
        .where('f.holding_id IN (:...ids)', { ids: holdingIds })
        .andWhere('f.flagged_by = :src', { src: FlagSource.AI })
        .getCount();

      const manualFlagCount = await this.flagRepo
        .createQueryBuilder('f')
        .where('f.holding_id IN (:...ids)', { ids: holdingIds })
        .andWhere('f.flagged_by = :src', { src: FlagSource.MANUAL })
        .getCount();

      status.push({
        fund_id: fund.id,
        fund_name: fund.name,
        ai_flags: aiFlagCount,
        manual_flags: manualFlagCount,
      });
    }

    return status;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Classify a single company against the Steward Christian Screen Methodology.
   * Uses GPT-4o-mini with JSON mode for structured, parseable responses.
   */
  private async classifyCompany(
    companyName: string,
    isin?: string,
    sector?: string,
    country?: string,
  ): Promise<AiScreenResult> {
    const userContent = [
      `Company: ${companyName}`,
      isin ? `ISIN: ${isin}` : null,
      sector ? `Sector: ${sector}` : null,
      country ? `Country: ${country}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: CHRISTIAN_SCREEN_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? '{"flags":[]}';
      const parsed = JSON.parse(raw) as AiScreenResult;

      // Validate and sanitise
      if (!Array.isArray(parsed.flags)) {
        return { flags: [] };
      }

      const validCategories: CategoryKey[] = [
        'alcohol', 'tobacco', 'gambling', 'abortion', 'weapons', 'pornography', 'cannabis',
      ];

      parsed.flags = parsed.flags.filter(
        (f) =>
          validCategories.includes(f.category as CategoryKey) &&
          typeof f.confidence === 'number' &&
          f.confidence >= MIN_CONFIDENCE,
      );

      this.logger.debug(
        `${companyName}: ${parsed.flags.length} flag(s) — ${parsed.flags.map((f) => `${f.category}@${f.confidence}`).join(', ') || 'clean'}`,
      );

      return parsed;
    } catch (err) {
      this.logger.error(`OpenAI classification failed for "${companyName}": ${err}`);
      return { flags: [] };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
