import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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
