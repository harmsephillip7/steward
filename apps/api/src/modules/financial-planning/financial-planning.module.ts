import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialPlan } from './entities/financial-plan.entity';
import { TaxCalculation } from './entities/tax-calculation.entity';
import { FinancialPlanningService } from './financial-planning.service';
import { TaxService } from './tax.service';
import { RiskProfilingService } from './risk-profiling.service';
import { BehaviourService } from './behaviour.service';
import { FinancialPlanningController } from './financial-planning.controller';
import { ClientsModule } from '../clients/clients.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialPlan, TaxCalculation]),
    ClientsModule,
    AuditModule,
  ],
  controllers: [FinancialPlanningController],
  providers: [FinancialPlanningService, TaxService, RiskProfilingService, BehaviourService],
  exports: [FinancialPlanningService, TaxService],
})
export class FinancialPlanningModule {}
