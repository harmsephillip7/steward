import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateClientComplianceDto,
  CreateDependentDto,
  CreateClientAssetDto,
  CreateLiabilityDto,
  CreateInsurancePolicyDto,
  CreateFinancialGoalDto,
  CreateLifeEventDto,
  CreateIncomeExpenseDto,
} from './dto/client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@Request() req: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clients for the advisor' })
  findAll(@Request() req: any) {
    return this.clientsService.findAllByAdvisor(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single client with portfolios and ROAs' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client details' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, req.user.id, dto);
  }

  @Patch(':id/compliance')
  @ApiOperation({ summary: 'Update client compliance and KYC status' })
  updateCompliance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClientComplianceDto,
  ) {
    return this.clientsService.updateCompliance(id, req.user.id, dto);
  }

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Get client compliance status' })
  async getCompliance(@Request() req: any, @Param('id') id: string) {
    const client = await this.clientsService.findOne(id, req.user.id);
    return this.clientsService.getComplianceStatus(client);
  }

  // ── Full Profile ─────────────────────────────────────────────────

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get full client profile with all sub-entities' })
  getProfile(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getFullProfile(id, req.user.id);
  }

  @Get(':id/net-worth')
  @ApiOperation({ summary: 'Get net worth summary' })
  getNetWorth(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getNetWorth(id, req.user.id);
  }

  @Get(':id/cash-flow')
  @ApiOperation({ summary: 'Get cash flow summary' })
  getCashFlow(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getCashFlow(id, req.user.id);
  }

  // ── Dependents ───────────────────────────────────────────────────

  @Get(':id/dependents')
  getDependents(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getDependents(id, req.user.id);
  }

  @Post(':id/dependents')
  addDependent(@Request() req: any, @Param('id') id: string, @Body() dto: CreateDependentDto) {
    return this.clientsService.addDependent(id, req.user.id, dto);
  }

  @Delete(':id/dependents/:depId')
  removeDependent(@Request() req: any, @Param('id') id: string, @Param('depId') depId: string) {
    return this.clientsService.removeDependent(id, req.user.id, depId);
  }

  // ── Assets ───────────────────────────────────────────────────────

  @Get(':id/assets')
  getAssets(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getAssets(id, req.user.id);
  }

  @Post(':id/assets')
  addAsset(@Request() req: any, @Param('id') id: string, @Body() dto: CreateClientAssetDto) {
    return this.clientsService.addAsset(id, req.user.id, dto);
  }

  @Patch(':id/assets/:assetId')
  updateAsset(@Request() req: any, @Param('id') id: string, @Param('assetId') assetId: string, @Body() dto: Partial<CreateClientAssetDto>) {
    return this.clientsService.updateAsset(id, req.user.id, assetId, dto);
  }

  @Delete(':id/assets/:assetId')
  removeAsset(@Request() req: any, @Param('id') id: string, @Param('assetId') assetId: string) {
    return this.clientsService.removeAsset(id, req.user.id, assetId);
  }

  // ── Liabilities ──────────────────────────────────────────────────

  @Get(':id/liabilities')
  getLiabilities(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getLiabilities(id, req.user.id);
  }

  @Post(':id/liabilities')
  addLiability(@Request() req: any, @Param('id') id: string, @Body() dto: CreateLiabilityDto) {
    return this.clientsService.addLiability(id, req.user.id, dto);
  }

  @Patch(':id/liabilities/:liabId')
  updateLiability(@Request() req: any, @Param('id') id: string, @Param('liabId') liabId: string, @Body() dto: Partial<CreateLiabilityDto>) {
    return this.clientsService.updateLiability(id, req.user.id, liabId, dto);
  }

  @Delete(':id/liabilities/:liabId')
  removeLiability(@Request() req: any, @Param('id') id: string, @Param('liabId') liabId: string) {
    return this.clientsService.removeLiability(id, req.user.id, liabId);
  }

  // ── Insurance ────────────────────────────────────────────────────

  @Get(':id/insurance')
  getInsurance(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getInsurance(id, req.user.id);
  }

  @Post(':id/insurance')
  addInsurance(@Request() req: any, @Param('id') id: string, @Body() dto: CreateInsurancePolicyDto) {
    return this.clientsService.addInsurance(id, req.user.id, dto);
  }

  @Patch(':id/insurance/:polId')
  updateInsurance(@Request() req: any, @Param('id') id: string, @Param('polId') polId: string, @Body() dto: Partial<CreateInsurancePolicyDto>) {
    return this.clientsService.updateInsurance(id, req.user.id, polId, dto);
  }

  @Delete(':id/insurance/:polId')
  removeInsurance(@Request() req: any, @Param('id') id: string, @Param('polId') polId: string) {
    return this.clientsService.removeInsurance(id, req.user.id, polId);
  }

  // ── Goals ────────────────────────────────────────────────────────

  @Get(':id/goals')
  getGoals(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getGoals(id, req.user.id);
  }

  @Post(':id/goals')
  addGoal(@Request() req: any, @Param('id') id: string, @Body() dto: CreateFinancialGoalDto) {
    return this.clientsService.addGoal(id, req.user.id, dto);
  }

  @Patch(':id/goals/:goalId')
  updateGoal(@Request() req: any, @Param('id') id: string, @Param('goalId') goalId: string, @Body() dto: Partial<CreateFinancialGoalDto>) {
    return this.clientsService.updateGoal(id, req.user.id, goalId, dto);
  }

  @Delete(':id/goals/:goalId')
  removeGoal(@Request() req: any, @Param('id') id: string, @Param('goalId') goalId: string) {
    return this.clientsService.removeGoal(id, req.user.id, goalId);
  }

  // ── Life Events ──────────────────────────────────────────────────

  @Get(':id/life-events')
  getLifeEvents(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getLifeEvents(id, req.user.id);
  }

  @Post(':id/life-events')
  addLifeEvent(@Request() req: any, @Param('id') id: string, @Body() dto: CreateLifeEventDto) {
    return this.clientsService.addLifeEvent(id, req.user.id, dto);
  }

  @Patch(':id/life-events/:eventId/review')
  reviewLifeEvent(@Request() req: any, @Param('id') id: string, @Param('eventId') eventId: string) {
    return this.clientsService.reviewLifeEvent(id, req.user.id, eventId);
  }

  @Delete(':id/life-events/:eventId')
  removeLifeEvent(@Request() req: any, @Param('id') id: string, @Param('eventId') eventId: string) {
    return this.clientsService.removeLifeEvent(id, req.user.id, eventId);
  }

  // ── Income / Expenses ────────────────────────────────────────────

  @Get(':id/income-expenses')
  getIncomeExpenses(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.getIncomeExpenses(id, req.user.id);
  }

  @Post(':id/income-expenses')
  addIncomeExpense(@Request() req: any, @Param('id') id: string, @Body() dto: CreateIncomeExpenseDto) {
    return this.clientsService.addIncomeExpense(id, req.user.id, dto);
  }

  @Patch(':id/income-expenses/:ieId')
  updateIncomeExpense(@Request() req: any, @Param('id') id: string, @Param('ieId') ieId: string, @Body() dto: Partial<CreateIncomeExpenseDto>) {
    return this.clientsService.updateIncomeExpense(id, req.user.id, ieId, dto);
  }

  @Delete(':id/income-expenses/:ieId')
  removeIncomeExpense(@Request() req: any, @Param('id') id: string, @Param('ieId') ieId: string) {
    return this.clientsService.removeIncomeExpense(id, req.user.id, ieId);
  }
}
