import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AdvisorsModule } from './modules/advisors/advisors.module';
import { ClientsModule } from './modules/clients/clients.module';
import { FundsModule } from './modules/funds/funds.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { ScreeningModule } from './modules/screening/screening.module';
import { ReplacementModule } from './modules/replacement/replacement.module';
import { FinancialPlanningModule } from './modules/financial-planning/financial-planning.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { AiScreeningModule } from './modules/ai-screening/ai-screening.module';

// Entities
import { Advisor } from './modules/advisors/entities/advisor.entity';
import { Client } from './modules/clients/entities/client.entity';
import { Fund } from './modules/funds/entities/fund.entity';
import { Holding } from './modules/funds/entities/holding.entity';
import { CompromiseFlag } from './modules/funds/entities/compromise-flag.entity';
import { Portfolio } from './modules/portfolios/entities/portfolio.entity';
import { PortfolioFund } from './modules/portfolios/entities/portfolio-fund.entity';
import { ScreeningResult } from './modules/screening/entities/screening-result.entity';
import { CategoryExposure } from './modules/screening/entities/category-exposure.entity';
import { ReplacementSuggestion } from './modules/replacement/entities/replacement-suggestion.entity';
import { FinancialPlan } from './modules/financial-planning/entities/financial-plan.entity';
import { TaxCalculation } from './modules/financial-planning/entities/tax-calculation.entity';
import { RecordOfAdvice } from './modules/compliance/entities/record-of-advice.entity';
import { AuditLog } from './modules/audit/entities/audit-log.entity';
import { IngestionJob } from './modules/funds/entities/ingestion-job.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [
          Advisor, Client, Fund, Holding, CompromiseFlag,
          Portfolio, PortfolioFund, ScreeningResult, CategoryExposure,
          ReplacementSuggestion, FinancialPlan, TaxCalculation,
          RecordOfAdvice, AuditLog, IngestionJob,
        ],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: false,
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    AdvisorsModule,
    ClientsModule,
    FundsModule,
    PortfoliosModule,
    ScreeningModule,
    ReplacementModule,
    FinancialPlanningModule,
    ComplianceModule,
    ReportsModule,
    AuditModule,
    AiScreeningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
