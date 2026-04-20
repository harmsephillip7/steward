import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrmService } from './crm.service';
import {
  CreateLeadDto, UpdateLeadDto, CreateActivityDto, CreateTaskDto,
  CreateProposalDto, UpdateProposalDto,
  CreateProposalTemplateDto, UpdateProposalTemplateDto,
} from './dto/crm.dto';

@ApiTags('crm')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  // ── Leads ────────────────────────────────────────────────────────

  @Post('leads')
  createLead(@Request() req: any, @Body() dto: CreateLeadDto) {
    return this.crm.createLead(req.user.id, dto);
  }

  @Get('leads')
  findLeads(@Request() req: any, @Query('stage') stage?: string, @Query('source') source?: string) {
    return this.crm.findAllLeads(req.user.id, stage, source);
  }

  @Get('leads/pipeline')
  getPipeline(@Request() req: any) {
    return this.crm.getPipeline(req.user.id);
  }

  @Get('leads/:id')
  findOneLead(@Request() req: any, @Param('id') id: string) {
    return this.crm.findOneLead(id, req.user.id);
  }

  @Patch('leads/:id')
  updateLead(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.crm.updateLead(id, req.user.id, dto);
  }

  @Post('leads/:id/convert')
  convertLead(@Request() req: any, @Param('id') id: string) {
    return this.crm.convertLead(id, req.user.id);
  }

  @Get('leads/:id/stage-progress')
  getStageProgress(@Request() req: any, @Param('id') id: string) {
    return this.crm.getStageProgress(id, req.user.id);
  }

  // ── Activities ───────────────────────────────────────────────────

  @Post('activities')
  createActivity(@Request() req: any, @Body() dto: CreateActivityDto) {
    return this.crm.createActivity(req.user.id, dto);
  }

  @Get('activities')
  getActivities(@Request() req: any, @Query('lead_id') leadId?: string, @Query('client_id') clientId?: string) {
    return this.crm.getActivities(req.user.id, leadId, clientId);
  }

  @Patch('activities/:id/complete')
  completeActivity(@Request() req: any, @Param('id') id: string) {
    return this.crm.completeActivity(id, req.user.id);
  }

  // ── Tasks ────────────────────────────────────────────────────────

  @Post('tasks')
  createTask(@Request() req: any, @Body() dto: CreateTaskDto) {
    return this.crm.createTask(req.user.id, dto);
  }

  @Get('tasks')
  getTasks(@Request() req: any, @Query('completed') completed?: string) {
    const done = completed === 'true' ? true : completed === 'false' ? false : undefined;
    return this.crm.getTasks(req.user.id, done);
  }

  @Patch('tasks/:id/complete')
  completeTask(@Request() req: any, @Param('id') id: string) {
    return this.crm.completeTask(id, req.user.id);
  }

  @Delete('tasks/:id')
  deleteTask(@Request() req: any, @Param('id') id: string) {
    return this.crm.deleteTask(id, req.user.id);
  }

  // ── Proposals ────────────────────────────────────────────────────

  @Post('proposals')
  createProposal(@Request() req: any, @Body() dto: CreateProposalDto) {
    return this.crm.createProposal(req.user.id, dto);
  }

  @Get('proposals')
  findProposals(@Request() req: any) {
    return this.crm.findAllProposals(req.user.id);
  }

  @Get('proposals/:id')
  findOneProposal(@Request() req: any, @Param('id') id: string) {
    return this.crm.findOneProposal(id, req.user.id);
  }

  @Patch('proposals/:id')
  updateProposal(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.crm.updateProposal(id, req.user.id, dto);
  }

  @Post('proposals/:id/send')
  sendProposal(@Request() req: any, @Param('id') id: string) {
    return this.crm.sendProposal(id, req.user.id);
  }

  // ── Proposal Templates ───────────────────────────────────────────

  @Post('proposal-templates')
  createTemplate(@Request() req: any, @Body() dto: CreateProposalTemplateDto) {
    return this.crm.createProposalTemplate(req.user.id, dto);
  }

  @Get('proposal-templates')
  findTemplates(@Request() req: any) {
    return this.crm.findAllProposalTemplates(req.user.id);
  }

  @Get('proposal-templates/:id')
  findOneTemplate(@Request() req: any, @Param('id') id: string) {
    return this.crm.findOneProposalTemplate(id, req.user.id);
  }

  @Patch('proposal-templates/:id')
  updateTemplate(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateProposalTemplateDto) {
    return this.crm.updateProposalTemplate(id, req.user.id, dto);
  }

  @Delete('proposal-templates/:id')
  deleteTemplate(@Request() req: any, @Param('id') id: string) {
    return this.crm.deleteProposalTemplate(id, req.user.id);
  }

  // ── Onboarding ───────────────────────────────────────────────────

  @Post('clients/:id/onboarding')
  createOnboarding(@Request() req: any, @Param('id') id: string) {
    return this.crm.createOnboarding(id, req.user.id);
  }

  @Get('clients/:id/onboarding')
  getOnboarding(@Request() req: any, @Param('id') id: string) {
    return this.crm.getOnboarding(id, req.user.id);
  }

  @Patch('clients/:id/onboarding/:key')
  updateOnboardingItem(
    @Request() req: any,
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: { completed: boolean },
  ) {
    return this.crm.updateOnboardingItem(id, req.user.id, key, body.completed);
  }
}
