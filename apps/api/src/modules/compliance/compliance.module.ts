import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordOfAdvice } from './entities/record-of-advice.entity';
import { ComplianceReview, ConflictOfInterest, RegulatoryReturn } from './entities/enhanced-compliance.entity';
import { FitAndProperRecord } from './entities/fit-and-proper.entity';
import { CpdRecord } from './entities/cpd-record.entity';
import { Complaint } from './entities/complaint.entity';
import { SanctionsScreen } from './entities/sanctions-screen.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { EnhancedComplianceService } from './enhanced-compliance.service';
import { EnhancedComplianceController } from './enhanced-compliance.controller';
import { ComplianceGuard } from './guards/compliance.guard';
import { FitAndProperService } from './services/fit-and-proper.service';
import { CpdService } from './services/cpd.service';
import { ComplaintsService } from './services/complaints.service';
import { SanctionsService } from './services/sanctions.service';
import { ComplianceRegisterController } from './controllers/compliance-register.controller';
import { ClientsModule } from '../clients/clients.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecordOfAdvice,
      ComplianceReview,
      ConflictOfInterest,
      RegulatoryReturn,
      FitAndProperRecord,
      CpdRecord,
      Complaint,
      SanctionsScreen,
    ]),
    ClientsModule,
    AuditModule,
  ],
  controllers: [ComplianceController, EnhancedComplianceController, ComplianceRegisterController],
  providers: [
    ComplianceService,
    EnhancedComplianceService,
    ComplianceGuard,
    FitAndProperService,
    CpdService,
    ComplaintsService,
    SanctionsService,
  ],
  exports: [
    ComplianceService,
    EnhancedComplianceService,
    ComplianceGuard,
    FitAndProperService,
    CpdService,
    ComplaintsService,
    SanctionsService,
  ],
})
export class ComplianceModule {}
