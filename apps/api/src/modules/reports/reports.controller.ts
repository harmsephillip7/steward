import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('portfolio')
  @ApiOperation({ summary: 'Generate a portfolio screening report (HTML / PDF)' })
  generatePortfolioReport(@Request() req: any, @Body() body: any) {
    return this.reportsService.generatePortfolioReport(req.user.id, body);
  }
}
