import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fund } from './entities/fund.entity';
import { Holding } from './entities/holding.entity';
import { CompromiseFlag } from './entities/compromise-flag.entity';
import { IngestionJob } from './entities/ingestion-job.entity';
import { AssetClass, CompromiseCategory, FlagSource, IngestionStatus, Region } from '@steward/shared';

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(Fund)
    private readonly fundRepo: Repository<Fund>,
    @InjectRepository(Holding)
    private readonly holdingRepo: Repository<Holding>,
    @InjectRepository(CompromiseFlag)
    private readonly flagRepo: Repository<CompromiseFlag>,
    @InjectRepository(IngestionJob)
    private readonly jobRepo: Repository<IngestionJob>,
  ) {}

  findAll(filters?: { asset_class?: AssetClass; region?: Region }): Promise<Fund[]> {
    const where: Partial<Fund> = {};
    if (filters?.asset_class) where.asset_class = filters.asset_class;
    if (filters?.region) where.region = filters.region;
    return this.fundRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Fund> {
    const fund = await this.fundRepo.findOne({
      where: { id },
      relations: ['holdings', 'holdings.compromise_flags'],
    });
    if (!fund) throw new NotFoundException('Fund not found');
    return fund;
  }

  async create(data: Partial<Fund>): Promise<Fund> {
    const fund = this.fundRepo.create(data);
    return this.fundRepo.save(fund);
  }

  getHoldings(fundId: string): Promise<Holding[]> {
    return this.holdingRepo.find({
      where: { fund_id: fundId },
      relations: ['compromise_flags'],
      order: { weight_pct: 'DESC' },
    });
  }

  async flagHolding(
    holdingId: string,
    category: CompromiseCategory,
    confidence: number,
    source: FlagSource = FlagSource.MANUAL,
    notes?: string,
  ): Promise<CompromiseFlag> {
    const flag = this.flagRepo.create({
      holding_id: holdingId,
      category,
      confidence_score: confidence,
      flagged_by: source,
      notes,
    });
    return this.flagRepo.save(flag);
  }

  async createIngestionJob(filename: string, fundId?: string): Promise<IngestionJob> {
    const job = this.jobRepo.create({
      filename,
      fund_id: fundId,
      status: IngestionStatus.PENDING,
    });
    return this.jobRepo.save(job);
  }

  async updateIngestionJob(
    id: string,
    updates: Partial<IngestionJob>,
  ): Promise<IngestionJob> {
    await this.jobRepo.update(id, updates);
    return this.jobRepo.findOne({ where: { id } }) as Promise<IngestionJob>;
  }

  getIngestionJob(id: string): Promise<IngestionJob | null> {
    return this.jobRepo.findOne({ where: { id } });
  }
}
