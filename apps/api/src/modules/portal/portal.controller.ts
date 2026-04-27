import { Controller, Get, Post, Patch, Delete, Body, Param, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { PortalService } from './portal.service';

@ApiTags('portal')
@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  // ── Public: Portal Login ─────────────────────────────────────
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.portal.portalLogin(body.email, body.password);
  }

  // ── Portal User: Protected by portal token ───────────────────
  @UseGuards(PortalAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.portal.getPortalProfile(req.portalUser.client_id);
  }

  @UseGuards(PortalAuthGuard)
  @Get('portfolios')
  getPortfolios(@Request() req: any) {
    return this.portal.getPortalPortfolios(req.portalUser.client_id);
  }

  @UseGuards(PortalAuthGuard)
  @Get('goals')
  getGoals(@Request() req: any) {
    return this.portal.getPortalGoals(req.portalUser.client_id);
  }

  @UseGuards(PortalAuthGuard)
  @Get('insurance')
  getInsurance(@Request() req: any) {
    return this.portal.getPortalInsurance(req.portalUser.client_id);
  }

  // ── Portal: Reports inbox ────────────────────────────────────
  @UseGuards(PortalAuthGuard)
  @Get('inbox')
  getInbox(@Request() req: any) {
    return this.portal.getInbox(req.portalUser.client_id);
  }

  @UseGuards(PortalAuthGuard)
  @Get('inbox/:id')
  getInboxReport(@Request() req: any, @Param('id') id: string) {
    return this.portal.getInboxReport(req.portalUser.client_id, id);
  }

  @UseGuards(PortalAuthGuard)
  @Get('inbox/:id/download')
  async downloadInboxReport(@Request() req: any, @Param('id') id: string, @Res() res: Response) {
    const file = await this.portal.downloadInboxReport(req.portalUser.client_id, id);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }

  @UseGuards(PortalAuthGuard)
  @Post('inbox/:id/accept')
  acceptInboxReport(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { typed_name: string },
  ) {
    return this.portal.acceptInboxReport(req.portalUser.client_id, id, {
      typed_name: body.typed_name,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });
  }

  @UseGuards(PortalAuthGuard)
  @Post('inbox/:id/decline')
  declineInboxReport(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.portal.declineInboxReport(req.portalUser.client_id, id, {
      reason: body.reason,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });
  }

  // ── Advisor: Manage Portal Users ─────────────────────────────
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('users')
  createUser(@Request() req: any, @Body() body: { client_id: string; email: string; password: string }) {
    return this.portal.createPortalUser(req.user.id, body.client_id, body.email, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users')
  getUsers(@Request() req: any) {
    return this.portal.getPortalUsers(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/toggle')
  toggleUser(@Request() req: any, @Param('id') id: string) {
    return this.portal.togglePortalUser(id, req.user.id);
  }

  // ── Onboarding Links (Advisor-side) ──────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('onboarding-links')
  createOnboardingLink(
    @Request() req: any,
    @Body() body: { client_id: string; steps: string[]; expiry_days?: number },
  ) {
    return this.portal.createOnboardingLink(req.user.id, body.client_id, body.steps, body.expiry_days);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('onboarding-links')
  listOnboardingLinks(@Request() req: any) {
    return this.portal.listOnboardingLinks(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('onboarding-links/:id')
  revokeOnboardingLink(@Request() req: any, @Param('id') id: string) {
    return this.portal.revokeOnboardingLink(id, req.user.id);
  }

  /** Advisor helper: get outstanding steps for a client */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('onboarding-links/outstanding/:clientId')
  getOutstandingSteps(@Request() req: any, @Param('clientId') clientId: string) {
    return this.portal.getOutstandingStepsForClient(req.user.id, clientId);
  }

  // ── Public: Client-facing onboarding (no auth — token is credential) ──

  @Get('onboarding/:token')
  getOnboardingSession(@Param('token') token: string) {
    return this.portal.getOnboardingSession(token);
  }

  @Post('onboarding/:token/submit')
  submitOnboardingStep(
    @Param('token') token: string,
    @Body() body: { step: string; data: Record<string, any> },
  ) {
    return this.portal.submitOnboardingStep(token, body.step, body.data);
  }
}
