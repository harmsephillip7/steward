import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnhancedComplianceService } from './enhanced-compliance.service';

@ApiTags('enhanced-compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EnhancedComplianceController {
  constructor(private readonly svc: EnhancedComplianceService) {}

  // ── Dashboard ────────────────────────────────────────────────
  @Get('compliance/dashboard')
  getDashboard(@Request() req: any) {
    return this.svc.getComplianceDashboard(req.user.id);
  }

  // ── Reviews ──────────────────────────────────────────────────
  @Post('compliance/reviews')
  createReview(@Request() req: any, @Body() dto: any) {
    return this.svc.createReview(req.user.id, dto);
  }

  @Get('compliance/reviews')
  getReviews(@Request() req: any, @Query('client_id') clientId?: string) {
    return this.svc.getReviews(req.user.id, clientId);
  }

  @Get('compliance/reviews/overdue')
  getOverdueReviews(@Request() req: any) {
    return this.svc.getOverdueReviews(req.user.id);
  }

  @Patch('compliance/reviews/:id/complete')
  completeReview(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.completeReview(id, req.user.id, dto);
  }

  // ── Conflicts ────────────────────────────────────────────────
  @Post('compliance/conflicts')
  createConflict(@Request() req: any, @Body() dto: any) {
    return this.svc.createConflict(req.user.id, dto);
  }

  @Get('compliance/conflicts')
  getConflicts(@Request() req: any) {
    return this.svc.getConflicts(req.user.id);
  }

  @Patch('compliance/conflicts/:id')
  updateConflict(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateConflict(id, req.user.id, dto);
  }

  // ── Regulatory Returns ───────────────────────────────────────
  @Post('compliance/returns')
  createReturn(@Request() req: any, @Body() dto: any) {
    return this.svc.createReturn(req.user.id, dto);
  }

  @Get('compliance/returns')
  getReturns(@Request() req: any) {
    return this.svc.getReturns(req.user.id);
  }

  @Patch('compliance/returns/:id')
  updateReturn(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateReturn(id, req.user.id, dto);
  }
}
