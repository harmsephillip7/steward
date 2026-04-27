import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplacementSuggestion } from './entities/replacement-suggestion.entity';
import { ReplacementService } from './replacement.service';
import { ReplacementComparisonService } from './replacement-comparison.service.wrapper';
import { ReplacementController } from './replacement.controller';
import { FundsModule } from '../funds/funds.module';
import { ScreeningModule } from '../screening/screening.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReplacementSuggestion]),
    FundsModule,
    ScreeningModule,
    PortfoliosModule,
  ],
  controllers: [ReplacementController],
  providers: [ReplacementService, ReplacementComparisonService],
  exports: [ReplacementService, ReplacementComparisonService],
})
export class ReplacementModule {}
