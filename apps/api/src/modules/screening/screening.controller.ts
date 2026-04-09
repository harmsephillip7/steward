import { Controller, Post, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScreeningService } from './screening.service';
import { ScreeningMode } from '@steward/shared';

@ApiTags('screening')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('screening')
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Post('portfolio/:portfolioId')
  @ApiOperation({ summary: 'Run screening analysis on a portfolio' })
  @ApiQuery({ name: 'mode', enum: ScreeningMode, required: false })
  screenPortfolio(
    @Request() req: any,
    @Param('portfolioId') portfolioId: string,
    @Query('mode') mode: ScreeningMode = ScreeningMode.WEIGHTED,
  ) {
    return this.screeningService.screenPortfolio(portfolioId, mode, req.user.id);
  }

  @Get('portfolio/:portfolioId/history')
  @ApiOperation({ summary: 'Get screening history for a portfolio' })
  getHistory(@Param('portfolioId') portfolioId: string) {
    return this.screeningService.getHistory(portfolioId);
  }
}
