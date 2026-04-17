import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Dependent } from './entities/dependent.entity';
import { ClientAsset } from './entities/client-asset.entity';
import { Liability } from './entities/liability.entity';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { FinancialGoal } from './entities/financial-goal.entity';
import { LifeEvent } from './entities/life-event.entity';
import { IncomeExpense } from './entities/income-expense.entity';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Dependent,
      ClientAsset,
      Liability,
      InsurancePolicy,
      FinancialGoal,
      LifeEvent,
      IncomeExpense,
    ]),
    AuditModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
