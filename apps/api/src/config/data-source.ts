import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Advisor } from '../modules/advisors/entities/advisor.entity';
import { Client } from '../modules/clients/entities/client.entity';
import { Fund } from '../modules/funds/entities/fund.entity';
import { Holding } from '../modules/funds/entities/holding.entity';
import { CompromiseFlag } from '../modules/funds/entities/compromise-flag.entity';
import { Portfolio } from '../modules/portfolios/entities/portfolio.entity';
import { PortfolioFund } from '../modules/portfolios/entities/portfolio-fund.entity';
import { ScreeningResult } from '../modules/screening/entities/screening-result.entity';
import { CategoryExposure } from '../modules/screening/entities/category-exposure.entity';
import { ReplacementSuggestion } from '../modules/replacement/entities/replacement-suggestion.entity';
import { FinancialPlan } from '../modules/financial-planning/entities/financial-plan.entity';
import { TaxCalculation } from '../modules/financial-planning/entities/tax-calculation.entity';
import { RecordOfAdvice } from '../modules/compliance/entities/record-of-advice.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { IngestionJob } from '../modules/funds/entities/ingestion-job.entity';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [
    Advisor,
    Client,
    Fund,
    Holding,
    CompromiseFlag,
    Portfolio,
    PortfolioFund,
    ScreeningResult,
    CategoryExposure,
    ReplacementSuggestion,
    FinancialPlan,
    TaxCalculation,
    RecordOfAdvice,
    AuditLog,
    IngestionJob,
  ],
  migrations: ['dist/config/migrations/*.js'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});

export default AppDataSource;
