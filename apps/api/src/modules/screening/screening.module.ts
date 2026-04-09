import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreeningResult } from './entities/screening-result.entity';
import { CategoryExposure } from './entities/category-exposure.entity';
import { ScreeningService } from './screening.service';
import { ScreeningController } from './screening.controller';
import { FundsModule } from '../funds/funds.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScreeningResult, CategoryExposure]),
    FundsModule,
    PortfoliosModule,
    AuditModule,
  ],
  controllers: [ScreeningController],
  providers: [ScreeningService],
  exports: [ScreeningService],
})
export class ScreeningModule {}
