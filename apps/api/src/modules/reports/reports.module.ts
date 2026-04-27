import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity';
import { Client } from '../clients/entities/client.entity';
import { Advisor } from '../advisors/entities/advisor.entity';
import { ScreeningModule } from '../screening/screening.module';
import { FinancialPlanningModule } from '../financial-planning/financial-planning.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { AuditModule } from '../audit/audit.module';
import { StorageService } from '../../common/storage.service';
import { PdfService } from '../../common/pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Client, Advisor]),
    ScreeningModule,
    FinancialPlanningModule,
    ComplianceModule,
    AuditModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, StorageService, PdfService],
  exports: [ReportsService, StorageService, PdfService],
})
export class ReportsModule {}
