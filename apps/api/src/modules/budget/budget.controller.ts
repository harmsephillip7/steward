import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalAuthGuard } from '../portal/guards/portal-auth.guard';
import { BudgetService } from './budget.service';
import { AccountType } from './entities/budget-statement.entity';

@ApiTags('budget')
@Controller('portal/budget')
export class BudgetController {
  constructor(private readonly budget: BudgetService) {}

  // ── Client-facing routes (PortalAuthGuard) ────────────────────

  @UseGuards(PortalAuthGuard)
  @Get()
  getAnalysis(@Request() req: any) {
    return this.budget.getAnalysis(req.portalUser.client_id);
  }

  @UseGuards(PortalAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadStatement(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { statement_month: string; account_type?: AccountType },
  ) {
    return this.budget.uploadStatement(
      req.portalUser.client_id,
      file,
      body.statement_month,
      body.account_type ?? AccountType.CHEQUE,
    );
  }

  @UseGuards(PortalAuthGuard)
  @Post('analyse')
  analyse(@Request() req: any) {
    return this.budget.analyseStatements(req.portalUser.client_id);
  }

  @UseGuards(PortalAuthGuard)
  @Delete('statements/:id')
  deleteStatement(@Request() req: any, @Param('id') id: string) {
    return this.budget.deleteStatement(req.portalUser.client_id, id);
  }

  @UseGuards(PortalAuthGuard)
  @Patch('visibility')
  toggleVisibility(@Request() req: any) {
    return this.budget.toggleAdvisorVisibility(req.portalUser.client_id);
  }

  // ── Advisor-facing route (JwtAuthGuard) ───────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':clientId')
  getAdvisorView(@Param('clientId') clientId: string) {
    return this.budget.getAnalysisForAdvisor(clientId);
  }
}
