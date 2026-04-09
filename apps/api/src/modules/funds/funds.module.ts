import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from './entities/fund.entity';
import { Holding } from './entities/holding.entity';
import { CompromiseFlag } from './entities/compromise-flag.entity';
import { IngestionJob } from './entities/ingestion-job.entity';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fund, Holding, CompromiseFlag, IngestionJob])],
  controllers: [FundsController],
  providers: [FundsService],
  exports: [FundsService],
})
export class FundsModule {}
