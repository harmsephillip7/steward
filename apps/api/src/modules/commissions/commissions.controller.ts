import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommissionsService } from './commissions.service';

@ApiTags('commissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommissionsController {
  constructor(private readonly svc: CommissionsService) {}

  @Post('commissions')
  create(@Request() req: any, @Body() dto: any) {
    return this.svc.createCommission(req.user.id, dto);
  }

  @Get('commissions')
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.svc.getCommissions(req.user.id, status);
  }

  @Get('commissions/summary')
  getSummary(@Request() req: any, @Query('year') year?: string) {
    return this.svc.getCommissionSummary(req.user.id, year ? +year : undefined);
  }

  @Patch('commissions/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateCommission(id, req.user.id, dto);
  }

  @Get('integrations')
  getIntegrations(@Request() req: any) {
    return this.svc.getIntegrations(req.user.id);
  }

  @Post('integrations')
  createIntegration(@Request() req: any, @Body() dto: any) {
    return this.svc.createIntegration(req.user.id, dto);
  }

  @Patch('integrations/:id')
  updateIntegration(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateIntegration(id, req.user.id, dto);
  }

  @Delete('integrations/:id')
  deleteIntegration(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteIntegration(id, req.user.id);
  }
}
