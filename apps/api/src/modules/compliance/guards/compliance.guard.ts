import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ClientsService } from '../../clients/clients.service';

/**
 * FAIS Compliance Guard.
 * Blocks advice endpoints unless the target client has completed all compliance requirements.
 * Apply to any controller that generates financial advice or reports.
 *
 * Usage: @UseGuards(JwtAuthGuard, ComplianceGuard)
 * Requires that the route has a :clientId param.
 */
@Injectable()
export class ComplianceGuard implements CanActivate {
  constructor(private readonly clientsService: ClientsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const advisorId: string = request.user?.id;
    const clientId: string = request.params?.clientId;

    if (!clientId) return true; // No client in context — don't block

    const client = await this.clientsService.findOne(clientId, advisorId);
    const { passed, failed_checks } = this.clientsService.getComplianceStatus(client);

    if (!passed) {
      throw new ForbiddenException({
        message: 'Client does not meet compliance requirements for advice',
        failed_checks,
      });
    }

    return true;
  }
}
