import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FundsService } from './funds.service';
import { AssetClass, Region } from '@steward/shared';

@ApiTags('funds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get()
  @ApiOperation({ summary: 'List all funds (filterable by asset class / region)' })
  @ApiQuery({ name: 'asset_class', enum: AssetClass, required: false })
  @ApiQuery({ name: 'region', enum: Region, required: false })
  findAll(
    @Query('asset_class') asset_class?: AssetClass,
    @Query('region') region?: Region,
  ) {
    return this.fundsService.findAll({ asset_class, region });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fund detail with holdings' })
  findOne(@Param('id') id: string) {
    return this.fundsService.findOne(id);
  }

  @Get(':id/holdings')
  @ApiOperation({ summary: 'Get all holdings for a fund' })
  getHoldings(@Param('id') id: string) {
    return this.fundsService.getHoldings(id);
  }

  @Post()
  @ApiOperation({ summary: 'Manually create a fund record' })
  create(@Body() body: any) {
    return this.fundsService.create(body);
  }

  @Get('ingestion/:jobId/status')
  @ApiOperation({ summary: 'Check ingestion job status' })
  ingestionStatus(@Param('jobId') jobId: string) {
    return this.fundsService.getIngestionJob(jobId);
  }
}
