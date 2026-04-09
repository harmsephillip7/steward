import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Fund } from '../funds/entities/fund.entity';
import { Holding } from '../funds/entities/holding.entity';
import { CompromiseFlag } from '../funds/entities/compromise-flag.entity';
import { AiScreeningService } from './ai-screening.service';
import { AiScreeningController } from './ai-screening.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Fund, Holding, CompromiseFlag]),
  ],
  controllers: [AiScreeningController],
  providers: [AiScreeningService],
  exports: [AiScreeningService],
})
export class AiScreeningModule {}
