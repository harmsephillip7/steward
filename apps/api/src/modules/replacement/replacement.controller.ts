import { Controller, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReplacementService } from './replacement.service';

@ApiTags('replacement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolios/:portfolioId/replacements')
export class ReplacementController {
  constructor(private readonly replacementService: ReplacementService) {}

  @Post()
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
}
