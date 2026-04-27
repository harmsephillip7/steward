import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit log (filtered by client/action/date)' })
  getLog(
    @Request() req: any,
    @Query('client_id') clientId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getLog({
      advisorId: req.user.id,
      clientId,
      action,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify the integrity of the audit hash chain' })
  verify() {
    return this.auditService.verifyChain();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export an audit pack (JSON) for FSCA inspection' })
  exportJson(
    @Request() req: any,
    @Query('client_id') clientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditService.exportJson({
      advisorId: req.user.id,
      clientId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}
