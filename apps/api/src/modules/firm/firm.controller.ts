import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FirmService } from './firm.service';

@ApiTags('firm')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('firm')
export class FirmController {
  constructor(private readonly svc: FirmService) {}

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.svc.createFirm(req.user.id, dto);
  }

  @Get()
  getMyFirm(@Request() req: any) {
    return this.svc.getMyFirm(req.user.id);
  }

  @Patch()
  update(@Request() req: any, @Body() dto: any) {
    return this.svc.updateFirm(req.user.id, dto);
  }

  // Members
  @Post('members')
  addMember(@Request() req: any, @Body() dto: { advisor_id: string; role: string }) {
    return this.svc.addMember(req.user.id, dto);
  }

  @Patch('members/:id')
  updateMember(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateMember(req.user.id, id, dto);
  }

  @Delete('members/:id')
  removeMember(@Request() req: any, @Param('id') id: string) {
    return this.svc.removeMember(req.user.id, id);
  }

  // Teams
  @Post('teams')
  createTeam(@Request() req: any, @Body() dto: any) {
    return this.svc.createTeam(req.user.id, dto);
  }

  @Get('teams')
  getTeams(@Request() req: any) {
    return this.svc.getTeams(req.user.id);
  }

  @Post('teams/:id/members')
  addTeamMember(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.svc.addTeamMember(req.user.id, id, dto);
  }

  @Delete('teams/:id/members/:advisorId')
  removeTeamMember(@Request() req: any, @Param('id') id: string, @Param('advisorId') advisorId: string) {
    return this.svc.removeTeamMember(req.user.id, id, advisorId);
  }

  @Delete('teams/:id')
  deleteTeam(@Request() req: any, @Param('id') id: string) {
    return this.svc.deleteTeam(req.user.id, id);
  }
}
