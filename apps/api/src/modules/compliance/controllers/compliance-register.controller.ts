import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FitAndProperService } from '../services/fit-and-proper.service';
import { CpdService } from '../services/cpd.service';
import { ComplaintsService } from '../services/complaints.service';
import { SanctionsService } from '../services/sanctions.service';
import { ComplaintStatus } from '../entities/complaint.entity';

@ApiTags('compliance-register')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance')
export class ComplianceRegisterController {
  constructor(
    private readonly fitAndProper: FitAndProperService,
    private readonly cpd: CpdService,
    private readonly complaints: ComplaintsService,
    private readonly sanctions: SanctionsService,
  ) {}

  // ---- Fit & Proper ----
  @Get('fit-and-proper')
  @ApiOperation({ summary: 'List fit & proper attestations for the current advisor' })
  listFitAndProper(@Request() req: any) {
    return this.fitAndProper.list(req.user.advisor_id ?? req.user.id);
  }

  @Get('fit-and-proper/current')
  getCurrentFitAndProper(@Request() req: any) {
    return this.fitAndProper.getCurrent(req.user.advisor_id ?? req.user.id);
  }

  @Post('fit-and-proper')
  createFitAndProper(@Request() req: any, @Body() body: any) {
    return this.fitAndProper.create(req.user.advisor_id ?? req.user.id, body, req.user.id);
  }

  @Patch('fit-and-proper/:id')
  updateFitAndProper(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.fitAndProper.update(id, req.user.advisor_id ?? req.user.id, body);
  }

  @Post('fit-and-proper/:id/attest')
  attestFitAndProper(@Request() req: any, @Param('id') id: string) {
    return this.fitAndProper.attest(id, req.user.advisor_id ?? req.user.id);
  }

  // ---- CPD ----
  @Get('cpd')
  @ApiOperation({ summary: 'List CPD records' })
  listCpd(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.cpd.list(
      req.user.advisor_id ?? req.user.id,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('cpd/summary')
  @ApiOperation({ summary: 'Summarise CPD hours for a period' })
  cpdSummary(@Request() req: any, @Query('from') from: string, @Query('to') to: string) {
    return this.cpd.summary(req.user.advisor_id ?? req.user.id, new Date(from), new Date(to));
  }

  @Post('cpd')
  logCpd(@Request() req: any, @Body() body: any) {
    return this.cpd.log(req.user.advisor_id ?? req.user.id, body);
  }

  @Patch('cpd/:id')
  updateCpd(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.cpd.update(id, req.user.advisor_id ?? req.user.id, body);
  }

  @Delete('cpd/:id')
  deleteCpd(@Request() req: any, @Param('id') id: string) {
    return this.cpd.delete(id, req.user.advisor_id ?? req.user.id);
  }

  // ---- Complaints ----
  @Get('complaints')
  listComplaints(@Request() req: any) {
    return this.complaints.list(req.user.advisor_id ?? req.user.id);
  }

  @Get('complaints/ombud-eligible')
  ombudEligible(@Request() req: any) {
    return this.complaints.ombudEligible(req.user.advisor_id ?? req.user.id);
  }

  @Post('complaints')
  createComplaint(@Request() req: any, @Body() body: any) {
    return this.complaints.create(req.user.advisor_id ?? req.user.id, body);
  }

  @Patch('complaints/:id/status')
  setComplaintStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: ComplaintStatus; resolution_summary?: string; remedy?: any },
  ) {
    const { status, ...extras } = body;
    return this.complaints.updateStatus(
      id,
      req.user.advisor_id ?? req.user.id,
      status,
      extras,
    );
  }

  // ---- Sanctions ----
  @Get('sanctions')
  listSanctions(@Request() req: any) {
    return this.sanctions.list(req.user.advisor_id ?? req.user.id);
  }

  @Post('sanctions')
  recordSanctionsScreen(@Request() req: any, @Body() body: any) {
    return this.sanctions.record(req.user.advisor_id ?? req.user.id, body);
  }
}
