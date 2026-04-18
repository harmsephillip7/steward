import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { Lead, Activity, Task } from './entities/crm.entities';
import { Proposal } from './entities/proposal.entity';
import { OnboardingChecklist } from './entities/onboarding-checklist.entity';
import { Client } from '../clients/entities/client.entity';
import { Dependent } from '../clients/entities/dependent.entity';
import { IncomeExpense } from '../clients/entities/income-expense.entity';
import { ClientAsset } from '../clients/entities/client-asset.entity';
import { Liability } from '../clients/entities/liability.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, Activity, Task, Proposal, OnboardingChecklist, Client, Dependent, IncomeExpense, ClientAsset, Liability]),
    AuditModule,
  ],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
