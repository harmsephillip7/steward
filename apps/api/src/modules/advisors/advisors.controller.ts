import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdvisorsService } from './advisors.service';

@ApiTags('advisors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current advisor profile' })
  getMe(@Request() req: any) {
    return this.advisorsService.getProfile(req.user.id);
  }

  @Patch('me/branding')
  @ApiOperation({ summary: 'Update advisor branding (logo, colours, firm name)' })
  updateBranding(@Request() req: any, @Body() body: any) {
    return this.advisorsService.updateBranding(req.user.id, body);
  }
}
