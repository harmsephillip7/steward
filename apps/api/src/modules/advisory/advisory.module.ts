import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvisoryController } from './advisory.controller';
import { AdvisoryService } from './advisory.service';
import { AdvisoryRecommendation } from './entities/advisory-recommendation.entity';
import { Client } from '../clients/entities/client.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdvisoryRecommendation, Client]), AuditModule],
  controllers: [AdvisoryController],
  providers: [AdvisoryService],
  exports: [AdvisoryService],
})
export class AdvisoryModule {}
