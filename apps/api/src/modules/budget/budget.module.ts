import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BudgetStatement } from './entities/budget-statement.entity';
import { BudgetAnalysis } from './entities/budget-analysis.entity';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([BudgetStatement, BudgetAnalysis]),
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
