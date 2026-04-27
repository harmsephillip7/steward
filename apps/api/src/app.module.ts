import { Module } from '@nestjs/common';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationIdMiddleware } from './common/correlation-id.middleware';
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

// Entities — core
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

// Entities — client profile sub-entities
import { Dependent } from './modules/clients/entities/dependent.entity';
import { ClientAsset } from './modules/clients/entities/client-asset.entity';
import { Liability } from './modules/clients/entities/liability.entity';
import { InsurancePolicy } from './modules/clients/entities/insurance-policy.entity';
import { FinancialGoal } from './modules/clients/entities/financial-goal.entity';
import { LifeEvent } from './modules/clients/entities/life-event.entity';
import { IncomeExpense } from './modules/clients/entities/income-expense.entity';

// Entities — CRM
import { Lead, Activity, Task } from './modules/crm/entities/crm.entities';
import { Proposal } from './modules/crm/entities/proposal.entity';
import { ProposalTemplate } from './modules/crm/entities/proposal-template.entity';
import { OnboardingChecklist } from './modules/crm/entities/onboarding-checklist.entity';
import { CrmModule } from './modules/crm/crm.module';

// Entities — documents
import { Document } from './modules/documents/entities/document.entity';
import { DocumentsModule } from './modules/documents/documents.module';

// Entities — advisory
import { AdvisoryRecommendation } from './modules/advisory/entities/advisory-recommendation.entity';
import { AdvisoryModule } from './modules/advisory/advisory.module';

// Entities — reports
import { Report as ReportEntity } from './modules/reports/entities/report.entity';

// Entities — enhanced compliance
import { ComplianceReview, ConflictOfInterest, RegulatoryReturn } from './modules/compliance/entities/enhanced-compliance.entity';

// Entities — commissions & integrations
import { Commission, Integration } from './modules/commissions/entities/commission.entity';
import { CommissionsModule } from './modules/commissions/commissions.module';

// Entities — portal
import { ClientPortalUser } from './modules/portal/entities/client-portal-user.entity';
import { ClientOnboardingToken } from './modules/portal/entities/client-onboarding-token.entity';
import { PortalModule } from './modules/portal/portal.module';

// Entities — firm management
import { Firm, FirmMember, Team, TeamMember } from './modules/firm/entities/firm.entity';
import { FirmModule } from './modules/firm/firm.module';

// Entities — notifications
import { Notification } from './modules/notifications/entities/notification.entity';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

// Entities — messaging integrations
import { MessagingConnection } from './modules/messaging/entities/messaging-connection.entity';
import { Message } from './modules/messaging/entities/message.entity';
import { MessageTemplate } from './modules/messaging/entities/message-template.entity';
import { MessagingModule } from './modules/messaging/messaging.module';

// Entities — budget
import { BudgetStatement } from './modules/budget/entities/budget-statement.entity';
import { BudgetAnalysis } from './modules/budget/entities/budget-analysis.entity';
import { BudgetModule } from './modules/budget/budget.module';

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
          // Client profile sub-entities
          Dependent, ClientAsset, Liability, InsurancePolicy,
          FinancialGoal, LifeEvent, IncomeExpense,
          // CRM entities
          Lead, Activity, Task, Proposal, ProposalTemplate, OnboardingChecklist,
          // Documents
          Document,
          // Advisory
          AdvisoryRecommendation,
          // Enhanced Compliance
          ComplianceReview, ConflictOfInterest, RegulatoryReturn,
          // Commissions & Integrations
          Commission, Integration,
          // Portal
          ClientPortalUser, ClientOnboardingToken,
          // Firm management
          Firm, FirmMember, Team, TeamMember,
          // Notifications
          Notification,
          // Messaging integrations
          MessagingConnection, Message, MessageTemplate,
          // Budget
          BudgetStatement, BudgetAnalysis,
          // Reports
          ReportEntity,
        ],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: false,
        ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
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
    CrmModule,
    DocumentsModule,
    AdvisoryModule,
    CommissionsModule,
    PortalModule,
    FirmModule,
    NotificationsModule,
    DashboardModule,
    MessagingModule,
    BudgetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
