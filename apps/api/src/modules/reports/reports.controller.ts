import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService, GenerateReportDto } from './reports.service';
import { ReportType, ReportStatus } from './entities/report.entity';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a report (PDF) from a typed payload' })
  generate(@Request() req: any, @Body() body: GenerateReportDto) {
    return this.reportsService.generate(req.user.id, body, {
      ip: req.ip,
      correlationId: req.correlationId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List reports for the advisor' })
  list(
    @Request() req: any,
    @Query('client_id') client_id?: string,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.list(req.user.id, {
      client_id,
      type,
      status,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single report by id' })
  getById(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.getById(req.user.id, id);
  }

  @Post(':id/finalise')
  @ApiOperation({ summary: 'Lock the report (immutable from here)' })
  finalise(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.finalise(req.user.id, id, {
      ip: req.ip,
      correlationId: req.correlationId,
    });
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send the finalised report to the client portal' })
  send(@Request() req: any, @Param('id') id: string) {
    return this.reportsService.sendToClient(req.user.id, id, {
      ip: req.ip,
      correlationId: req.correlationId,
    });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download the rendered PDF (or HTML fallback)' })
  async download(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const { buffer, contentType, filename } = await this.reportsService.download(req.user.id, id);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.end(buffer);
  }

  // ── Legacy endpoint kept for backwards compatibility ─────────────
  @Post('portfolio')
  @ApiOperation({ summary: 'Legacy: HTML-only portfolio screening report' })
  generatePortfolioReport(@Request() req: any, @Body() body: any) {
    return this.reportsService.generatePortfolioReport(req.user.id, body);
  }
}
