import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/portfolio.dto';

@ApiTags('portfolios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Get()
  @ApiOperation({ summary: 'List all portfolios for the authenticated advisor' })
  findAll(@Request() req: any) {
    return this.portfoliosService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a portfolio with fund allocations' })
  create(@Request() req: any, @Body() dto: CreatePortfolioDto) {
    return this.portfoliosService.create(req.user.id, dto);
  }

  // static segment must be declared before :id to avoid NestJS route collision
  @Get('client/:clientId')
  @ApiOperation({ summary: 'List all portfolios for a client' })
  findByClient(@Param('clientId') clientId: string) {
    return this.portfoliosService.findAllByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio detail with funds and holdings' })
  findOne(@Param('id') id: string) {
    return this.portfoliosService.findOne(id);
  }
}
