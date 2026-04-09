import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancialPlanningService } from './financial-planning.service';
import { RiskProfilingService } from './risk-profiling.service';
import { BehaviourService } from './behaviour.service';
import { TaxService } from './tax.service';

@ApiTags('financial-planning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fna')
export class FinancialPlanningController {
  constructor(
    private readonly fnaService: FinancialPlanningService,
    private readonly riskService: RiskProfilingService,
    private readonly behaviourService: BehaviourService,
    private readonly taxService: TaxService,
  ) {}

  @Get('questions/risk')
  @ApiOperation({ summary: 'Get risk profiling questionnaire' })
  getRiskQuestions() {
    return this.riskService.getQuestions();
  }

  @Get('questions/behaviour')
  @ApiOperation({ summary: 'Get behavioural bias questionnaire' })
  getBehaviourQuestions() {
    return this.behaviourService.getQuestions();
  }

  @Post('clients/:clientId/plan')
  @ApiOperation({ summary: 'Create a full financial plan for a client' })
  createPlan(
    @Request() req: any,
    @Param('clientId') clientId: string,
    @Body() body: any,
  ) {
    return this.fnaService.createPlan(
      clientId,
      req.user.id,
      body.risk_answers,
      body.behaviour_answers,
      body.financials ?? {},
    );
  }

  @Get('clients/:clientId/plans')
  @ApiOperation({ summary: 'Get all financial plans for a client' })
  getPlans(@Param('clientId') clientId: string) {
    return this.fnaService.getPlansForClient(clientId);
  }

  @Post('tax/cgt')
  @ApiOperation({ summary: 'Calculate CGT on a disposal gain' })
  calculateCGT(@Body() body: { disposal_gain: number; marginal_rate?: number }) {
    return body.marginal_rate
      ? this.taxService.calculateCGTWithMarginalRate(body.disposal_gain, body.marginal_rate)
      : this.taxService.calculateCGT(body.disposal_gain);
  }

  @Post('tax/income')
  @ApiOperation({ summary: 'Calculate income tax for a given taxable income' })
  calculateIncomeTax(@Body() body: { taxable_income: number }) {
    return this.taxService.calculateIncomeTax(body.taxable_income);
  }

  @Post('tax/estate')
  @ApiOperation({ summary: 'Calculate estate duty' })
  calculateEstateDuty(@Body() body: { estate_value: number; spouse_rebate?: number }) {
    return this.taxService.calculateEstateDuty(body.estate_value, body.spouse_rebate);
  }
}
