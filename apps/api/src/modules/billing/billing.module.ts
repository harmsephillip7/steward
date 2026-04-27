import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan, Subscription, Invoice, UsageMeter } from './entities/billing.entity';
import { SalesLead } from './entities/sales-lead.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { SalesLeadsController } from './sales-leads.controller';
import { BillingGuard } from './billing.guard';
import { FirmMember } from '../firm/entities/firm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Subscription, Invoice, UsageMeter, SalesLead, FirmMember])],
  controllers: [BillingController, SalesLeadsController],
  providers: [BillingService, BillingGuard],
  exports: [BillingService, BillingGuard],
})
export class BillingModule {}
