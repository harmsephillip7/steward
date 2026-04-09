import { Controller, Post, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiScreeningService } from './ai-screening.service';
import { METHODOLOGY_CATEGORIES } from './christian-screen-methodology';

@ApiTags('ai-screening')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-screening')
export class AiScreeningController {
  constructor(private readonly service: AiScreeningService) {}

  @Post('fund/:id')
  @ApiOperation({
    summary: 'AI-screen all holdings in a single fund',
    description:
      'Analyses every holding in the fund against the Steward Christian Screen Methodology ' +
      'v1.0 using GPT-4o-mini. Existing AI-generated flags are replaced. Manual flags are ' +
      'preserved. Returns a summary of what was flagged.',
  })
  @ApiParam({ name: 'id', description: 'Fund UUID' })
  screenFund(@Param('id', ParseUUIDPipe) fundId: string) {
    return this.service.screenFund(fundId);
  }

  @Post('all')
  @ApiOperation({
    summary: 'AI-screen all holdings across every fund',
    description:
      'Iterates all funds and screens each holding. Companies sharing an ISIN across' +
      ' multiple funds are classified only once (cached). This may take 30–90 seconds ' +
      'depending on the number of holdings.',
  })
  screenAll() {
    return this.service.screenAllFunds();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get AI flag counts per fund',
    description: 'Returns the number of AI-generated and manual compromise flags per fund.',
  })
  getStatus() {
    return this.service.getStatus();
  }

  @Get('methodology')
  @ApiOperation({
    summary: 'Return the Steward Christian Screen Methodology v1.0 categories',
    description: 'Useful for displaying methodology info in the UI without hardcoding it.',
  })
  getMethodology() {
    return {
      version: '1.0',
      model: 'gpt-4o-mini',
      min_confidence_threshold: 0.30,
      categories: METHODOLOGY_CATEGORIES,
    };
  }
}
