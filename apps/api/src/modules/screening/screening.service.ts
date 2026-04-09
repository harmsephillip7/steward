import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CompromiseCategory,
  FundScreeningResult,
  PortfolioScreeningResult,
  ScreeningMode,
  CategoryExposure as CategoryExposureType,
} from '@steward/shared';
import { ScreeningResult } from './entities/screening-result.entity';
import { CategoryExposure } from './entities/category-exposure.entity';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { AuditService } from '../audit/audit.service';
import { Holding } from '../funds/entities/holding.entity';

@Injectable()
export class ScreeningService {
  constructor(
    @InjectRepository(ScreeningResult)
    private readonly screeningRepo: Repository<ScreeningResult>,
    @InjectRepository(CategoryExposure)
    private readonly categoryExposureRepo: Repository<CategoryExposure>,
    private readonly portfoliosService: PortfoliosService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Analyse a single set of holdings and return clean/compromised breakdown.
   */
  calculateCleanPct(holdings: Holding[]): {
    cleanPct: number;
    compromisedPct: number;
    byCategory: CategoryExposureType[];
  } {
    const totalWeight = holdings.reduce((sum, h) => sum + Number(h.weight_pct), 0);
    if (totalWeight === 0) {
      return { cleanPct: 100, compromisedPct: 0, byCategory: [] };
    }

    const exposureByCategory: Record<string, number> = {};
    const affectedFundsByCategory: Record<string, Set<string>> = {};

    for (const holding of holdings) {
      if (!holding.compromise_flags || holding.compromise_flags.length === 0) continue;

      const holdingWeight = Number(holding.weight_pct);

      for (const flag of holding.compromise_flags) {
        const cat = flag.category;
        const contribution = (holdingWeight / totalWeight) * 100 * Number(flag.confidence_score);
        exposureByCategory[cat] = (exposureByCategory[cat] ?? 0) + contribution;

        if (!affectedFundsByCategory[cat]) affectedFundsByCategory[cat] = new Set();
        affectedFundsByCategory[cat].add(holding.fund_id);
      }
    }

    const byCategory: CategoryExposureType[] = Object.entries(exposureByCategory).map(
      ([category, exposure_pct]) => ({
        category: category as CompromiseCategory,
        exposure_pct: Math.min(100, exposure_pct),
        affected_funds_count: affectedFundsByCategory[category]?.size ?? 0,
      }),
    );

    const compromisedPct = Math.min(
      100,
      byCategory.reduce((max, c) => Math.max(max, c.exposure_pct), 0),
    );

    return {
      cleanPct: Math.max(0, 100 - compromisedPct),
      compromisedPct,
      byCategory,
    };
  }

  /**
   * Screen a portfolio. Combines all fund holdings weighted by allocation.
   */
  async screenPortfolio(
    portfolioId: string,
    mode: ScreeningMode,
    advisorId: string,
  ): Promise<PortfolioScreeningResult> {
    const portfolio = await this.portfoliosService.findOne(portfolioId);

    const fundResults: FundScreeningResult[] = [];
    const aggregatedByCat: Record<string, number> = {};
    const affectedFundsByCat: Record<string, Set<string>> = {};

    for (const pf of portfolio.portfolio_funds) {
      const fund = pf.fund;
      const holdings = fund.holdings ?? [];
      const allocationPct = Number(pf.allocation_pct) / 100;

      const { cleanPct, compromisedPct, byCategory } = this.calculateCleanPct(holdings);

      fundResults.push({
        fund_id: fund.id,
        fund_name: fund.name,
        clean_pct: cleanPct,
        compromised_pct: compromisedPct,
        by_category: byCategory,
        flagged_holdings_count: holdings.filter((h) => (h.compromise_flags?.length ?? 0) > 0).length,
      });

      // Weight each fund's exposure by its portfolio allocation
      for (const cat of byCategory) {
        const weighted = cat.exposure_pct * allocationPct;
        aggregatedByCat[cat.category] = (aggregatedByCat[cat.category] ?? 0) + weighted;

        if (!affectedFundsByCat[cat.category]) affectedFundsByCat[cat.category] = new Set();
        affectedFundsByCat[cat.category].add(fund.id);
      }
    }

    const aggregatedCategories: CategoryExposureType[] = Object.entries(aggregatedByCat).map(
      ([category, exposure_pct]) => ({
        category: category as CompromiseCategory,
        exposure_pct: Math.min(100, exposure_pct),
        affected_funds_count: affectedFundsByCat[category]?.size ?? 0,
      }),
    );

    const totalCompromisedPct = Math.min(
      100,
      aggregatedCategories.reduce((max, c) => Math.max(max, c.exposure_pct), 0),
    );
    const totalCleanPct = Math.max(0, 100 - totalCompromisedPct);
    const passedStrict = mode === ScreeningMode.STRICT ? totalCompromisedPct === 0 : true;

    // Persist screening result
    const result = this.screeningRepo.create({
      portfolio_id: portfolioId,
      mode,
      clean_pct: totalCleanPct,
      compromised_pct: totalCompromisedPct,
      passed_strict_mode: passedStrict,
      report_json: { fund_results: fundResults } as any,
    });
    const saved = await this.screeningRepo.save(result);

    // Persist per-category exposures
    const catEntities = aggregatedCategories.map((c) =>
      this.categoryExposureRepo.create({
        screening_result_id: saved.id,
        category: c.category,
        exposure_pct: c.exposure_pct,
        affected_funds_count: c.affected_funds_count,
      }),
    );
    await this.categoryExposureRepo.save(catEntities);

    await this.auditService.log(advisorId, 'screening.run', 'screening_result', saved.id, {
      portfolio_id: portfolioId,
      mode,
    });

    return {
      portfolio_id: portfolioId,
      mode,
      clean_pct: totalCleanPct,
      compromised_pct: totalCompromisedPct,
      by_category: aggregatedCategories,
      fund_results: fundResults,
      passed_strict_mode: passedStrict,
    };
  }

  getHistory(portfolioId: string): Promise<ScreeningResult[]> {
    return this.screeningRepo.find({
      where: { portfolio_id: portfolioId },
      relations: ['category_exposures'],
      order: { created_at: 'DESC' },
    });
  }
}
