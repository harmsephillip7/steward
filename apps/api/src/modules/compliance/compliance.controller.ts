import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComplianceService } from './compliance.service';

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('roa')
  @ApiOperation({ summary: 'Create a new Record of Advice' })
  createROA(
    @Request() req: any,
    @Body() body: { client_id: string; advice_summary: string },
  ) {
    return this.complianceService.createROA(body.client_id, req.user.id, body.advice_summary);
  }

  @Patch('roa/:id/sign')
  @ApiOperation({ summary: 'Sign a Record of Advice' })
  signROA(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { signature_data?: string },
  ) {
    return this.complianceService.signROA(id, req.user.id, body.signature_data);
  }

  @Get('roa/client/:clientId')
  @ApiOperation({ summary: 'Get all ROAs for a client' })
  getROAHistory(@Param('clientId') clientId: string) {
    return this.complianceService.getROAHistory(clientId);
  }
}
