import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordOfAdvice } from './entities/record-of-advice.entity';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { ComplianceGuard } from './guards/compliance.guard';
import { ClientsModule } from '../clients/clients.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordOfAdvice]),
    ClientsModule,
    AuditModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService, ComplianceGuard],
  exports: [ComplianceService, ComplianceGuard],
})
export class ComplianceModule {}
