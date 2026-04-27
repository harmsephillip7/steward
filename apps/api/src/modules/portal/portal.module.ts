import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { ClientPortalUser } from './entities/client-portal-user.entity';
import { ClientOnboardingToken } from './entities/client-onboarding-token.entity';
import { Client } from '../clients/entities/client.entity';
import { Report } from '../reports/entities/report.entity';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientPortalUser, ClientOnboardingToken, Client, Report]),
    ReportsModule,
  ],
  controllers: [PortalController],
  providers: [PortalService],
  exports: [PortalService],
})
export class PortalModule {}
