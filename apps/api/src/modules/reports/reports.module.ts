import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ScreeningModule } from '../screening/screening.module';
import { FinancialPlanningModule } from '../financial-planning/financial-planning.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ScreeningModule, FinancialPlanningModule, ComplianceModule, AuditModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
