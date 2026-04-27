import { Body, Controller, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReplacementService } from './replacement.service';
import { ReplacementComparisonService } from './replacement-comparison.service.wrapper';
import { ReplacementCompareInput } from './replacement-comparison.service';

@ApiTags('replacement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReplacementController {
  constructor(
    private readonly replacementService: ReplacementService,
    private readonly comparison: ReplacementComparisonService,
  ) {}

  @Post('portfolios/:portfolioId/replacements')
  @ApiOperation({ summary: 'Generate replacement fund suggestions for a portfolio' })
  findReplacements(
    @Param('portfolioId') portfolioId: string,
    @Query('screening_result_id') screeningResultId: string,
    @Query('max_exposure_pct') maxExposurePct = '5',
  ) {
    return this.replacementService.findReplacements(
      portfolioId,
      screeningResultId,
      parseFloat(maxExposurePct),
    );
  }

  @Post('replacement/compare')
  @ApiOperation({
    summary: 'FAIS s8(1)(d) replacement comparison: existing vs proposed product',
    description:
      'Returns fee differential, break-even years, capitalised net benefit / cost over horizon, and required FAIS warnings (loyalty, surrender, guarantees, fees).',
  })
  compare(@Body() body: ReplacementCompareInput) {
    return this.comparison.compare(body);
  }
}
