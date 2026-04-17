import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordOfAdvice } from './entities/record-of-advice.entity';
import { ComplianceReview, ConflictOfInterest, RegulatoryReturn } from './entities/enhanced-compliance.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { EnhancedComplianceService } from './enhanced-compliance.service';
import { EnhancedComplianceController } from './enhanced-compliance.controller';
import { ComplianceGuard } from './guards/compliance.guard';
import { ClientsModule } from '../clients/clients.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordOfAdvice, ComplianceReview, ConflictOfInterest, RegulatoryReturn]),
    ClientsModule,
    AuditModule,
  ],
  controllers: [ComplianceController, EnhancedComplianceController],
  providers: [ComplianceService, EnhancedComplianceService, ComplianceGuard],
  exports: [ComplianceService, EnhancedComplianceService, ComplianceGuard],
})
export class ComplianceModule {}
