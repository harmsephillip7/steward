import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReplacementSuggestion } from './entities/replacement-suggestion.entity';
import { FundsService } from '../funds/funds.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { ScreeningService } from '../screening/screening.service';
import { ScreeningMode } from '@steward/shared';
import { Fund } from '../funds/entities/fund.entity';

const ASSET_CLASS_WEIGHT = 0.4;
const REGION_WEIGHT = 0.2;
const TER_WEIGHT = 0.2;
const RETURN_WEIGHT = 0.2;
const TER_THRESHOLD = 0.5;

@Injectable()
export class ReplacementService {
  constructor(
    @InjectRepository(ReplacementSuggestion)
    private readonly suggestionRepo: Repository<ReplacementSuggestion>,
    private readonly fundsService: FundsService,
    private readonly portfoliosService: PortfoliosService,
    private readonly screeningService: ScreeningService,
  ) {}

  scoreSimilarity(original: Fund, candidate: Fund): number {
    let score = 0;

    if (original.asset_class && candidate.asset_class === original.asset_class) {
      score += ASSET_CLASS_WEIGHT;
    }
    if (original.region && candidate.region === original.region) {
      score += REGION_WEIGHT;
    }
    if (
      original.ter != null &&
      candidate.ter != null &&
      Math.abs(Number(original.ter) - Number(candidate.ter)) <= TER_THRESHOLD
    ) {
      score += TER_WEIGHT;
    }
    // Placeholder: return correlation requires price series — default 0.5 multiplied by weight
    score += 0.5 * RETURN_WEIGHT;

    return Math.round(score * 10000) / 10000;
  }

  async findReplacements(
    portfolioId: string,
    screeningResultId: string,
    maxExposurePct = 5,
  ): Promise<ReplacementSuggestion[]> {
    const portfolio = await this.portfoliosService.findOne(portfolioId);
    const allFunds = await this.fundsService.findAll();

    const suggestions: ReplacementSuggestion[] = [];

    for (const pf of portfolio.portfolio_funds) {
      const original = pf.fund;
      const holdings = original.holdings ?? [];

      const { compromisedPct } = this.screeningService.calculateCleanPct(holdings);
      if (compromisedPct <= maxExposurePct) continue; // Already clean enough

      // Find candidates in same asset class + region that are cleaner
      const candidates = allFunds.filter(
        (f) =>
          f.id !== original.id &&
          f.asset_class === original.asset_class &&
          f.region === original.region,
      );

      const ranked = candidates
        .map((candidate) => {
          const candidateHoldings = candidate.holdings ?? [];
          const { compromisedPct: candidateExposure } =
            this.screeningService.calculateCleanPct(candidateHoldings);

          if (candidateExposure >= compromisedPct) return null; // Not cleaner

          const similarity = this.scoreSimilarity(original, candidate);
          const exposureReduction = compromisedPct - candidateExposure;

          return {
            original,
            candidate,
            similarity,
            exposureReduction,
            candidateExposure,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.similarity - a!.similarity || b!.exposureReduction - a!.exposureReduction)
        .slice(0, 3);

      for (const r of ranked) {
        if (!r) continue;
        const suggestion = this.suggestionRepo.create({
          screening_result_id: screeningResultId,
          original_fund_id: original.id,
          suggested_fund_id: r.candidate.id,
          similarity_score: r.similarity,
          exposure_reduction_pct: r.exposureReduction,
          reason: `Reduces ${original.asset_class} exposure from ${compromisedPct.toFixed(1)}% to ${r.candidateExposure.toFixed(1)}% with ${(r.similarity * 100).toFixed(0)}% profile match`,
        });
        suggestions.push(await this.suggestionRepo.save(suggestion));
      }
    }

    return this.suggestionRepo.find({
      where: { screening_result_id: screeningResultId },
      relations: ['original_fund', 'suggested_fund'],
    });
  }
}
