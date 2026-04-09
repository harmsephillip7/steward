import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioFund } from './entities/portfolio-fund.entity';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    @InjectRepository(PortfolioFund)
    private readonly portfolioFundRepo: Repository<PortfolioFund>,
    private readonly auditService: AuditService,
  ) {}

  async create(advisorId: string, dto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = this.portfolioRepo.create({
      client_id: dto.client_id,
      name: dto.name,
      total_value: dto.funds.reduce((sum, f) => sum + (f.value ?? 0), 0),
    });
    const saved = await this.portfolioRepo.save(portfolio);

    const portfolioFunds = dto.funds.map((f) =>
      this.portfolioFundRepo.create({
        portfolio_id: saved.id,
        fund_id: f.fund_id,
        allocation_pct: f.allocation_pct,
        value: f.value,
      }),
    );
    await this.portfolioFundRepo.save(portfolioFunds);

    await this.auditService.log(advisorId, 'portfolio.created', 'portfolio', saved.id);
    return this.findOne(saved.id);
  }

  async findOne(id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepo.findOne({
      where: { id },
      relations: [
        'portfolio_funds',
        'portfolio_funds.fund',
        'portfolio_funds.fund.holdings',
        'portfolio_funds.fund.holdings.compromise_flags',
        'screening_results',
      ],
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    return portfolio;
  }

  findAllByClient(clientId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { client_id: clientId },
      relations: ['portfolio_funds', 'portfolio_funds.fund'],
      order: { created_at: 'DESC' },
    });
  }
}
