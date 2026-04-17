import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdvisoryService } from './advisory.service';
import { GenerateAdvisoryDto, UpdateRecommendationDto } from './dto/advisory.dto';

@ApiTags('advisory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdvisoryController {
  constructor(private readonly advisory: AdvisoryService) {}

  @Post('advisory/generate')
  generate(@Request() req: any, @Body() dto: GenerateAdvisoryDto) {
    return this.advisory.generateRecommendations(req.user.id, dto.client_id, dto.focus_area);
  }

  @Get('advisory/dashboard')
  getDashboard(@Request() req: any) {
    return this.advisory.getDashboardSummary(req.user.id);
  }

  @Get('clients/:clientId/advisory')
  getByClient(@Request() req: any, @Param('clientId') clientId: string, @Query('status') status?: string) {
    return this.advisory.findByClient(clientId, req.user.id, status);
  }

  @Patch('advisory/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateRecommendationDto) {
    return this.advisory.update(id, req.user.id, dto);
  }
}
