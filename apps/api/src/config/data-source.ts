import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Advisor } from '../modules/advisors/entities/advisor.entity';
import { Client } from '../modules/clients/entities/client.entity';
import { Dependent } from '../modules/clients/entities/dependent.entity';
import { ClientAsset } from '../modules/clients/entities/client-asset.entity';
import { Liability } from '../modules/clients/entities/liability.entity';
import { IncomeExpense } from '../modules/clients/entities/income-expense.entity';
import { InsurancePolicy } from '../modules/clients/entities/insurance-policy.entity';
import { FinancialGoal } from '../modules/clients/entities/financial-goal.entity';
import { LifeEvent } from '../modules/clients/entities/life-event.entity';
import { Fund } from '../modules/funds/entities/fund.entity';
import { Holding } from '../modules/funds/entities/holding.entity';
import { CompromiseFlag } from '../modules/funds/entities/compromise-flag.entity';
import { IngestionJob } from '../modules/funds/entities/ingestion-job.entity';
import { Portfolio } from '../modules/portfolios/entities/portfolio.entity';
import { PortfolioFund } from '../modules/portfolios/entities/portfolio-fund.entity';
import { ScreeningResult } from '../modules/screening/entities/screening-result.entity';
import { CategoryExposure } from '../modules/screening/entities/category-exposure.entity';
import { ReplacementSuggestion } from '../modules/replacement/entities/replacement-suggestion.entity';
import { FinancialPlan } from '../modules/financial-planning/entities/financial-plan.entity';
import { TaxCalculation } from '../modules/financial-planning/entities/tax-calculation.entity';
import { RecordOfAdvice } from '../modules/compliance/entities/record-of-advice.entity';
import { ComplianceReview, ConflictOfInterest, RegulatoryReturn } from '../modules/compliance/entities/enhanced-compliance.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { AdvisoryRecommendation } from '../modules/advisory/entities/advisory-recommendation.entity';
import { Lead, Activity, Task } from '../modules/crm/entities/crm.entities';
import { Proposal } from '../modules/crm/entities/proposal.entity';
import { ProposalTemplate } from '../modules/crm/entities/proposal-template.entity';
import { OnboardingChecklist } from '../modules/crm/entities/onboarding-checklist.entity';
import { Document } from '../modules/documents/entities/document.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Commission } from '../modules/commissions/entities/commission.entity';
import { Integration } from '../modules/commissions/entities/commission.entity';
import { Firm, FirmMember, Team, TeamMember } from '../modules/firm/entities/firm.entity';
import { ClientPortalUser } from '../modules/portal/entities/client-portal-user.entity';
import { ClientOnboardingToken } from '../modules/portal/entities/client-onboarding-token.entity';
import { BudgetStatement } from '../modules/budget/entities/budget-statement.entity';
import { BudgetAnalysis } from '../modules/budget/entities/budget-analysis.entity';
import { MessagingConnection } from '../modules/messaging/entities/messaging-connection.entity';
import { Message } from '../modules/messaging/entities/message.entity';
import { MessageTemplate } from '../modules/messaging/entities/message-template.entity';

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
    Dependent,
    ClientAsset,
    Liability,
    IncomeExpense,
    InsurancePolicy,
    FinancialGoal,
    LifeEvent,
    Fund,
    Holding,
    CompromiseFlag,
    IngestionJob,
    Portfolio,
    PortfolioFund,
    ScreeningResult,
    CategoryExposure,
    ReplacementSuggestion,
    FinancialPlan,
    TaxCalculation,
    RecordOfAdvice,
    ComplianceReview,
    ConflictOfInterest,
    RegulatoryReturn,
    AuditLog,
    AdvisoryRecommendation,
    Lead,
    Activity,
    Task,
    Proposal,
    ProposalTemplate,
    OnboardingChecklist,
    Document,
    Notification,
    Commission,
    Firm,
    FirmMember,
    Team,
    TeamMember,
    ClientPortalUser,
    ClientOnboardingToken,
    BudgetStatement,
    BudgetAnalysis,
    MessagingConnection,
    Message,
    MessageTemplate,
  ],
  migrations: ['dist/config/migrations/*.js'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});

export default AppDataSource;
