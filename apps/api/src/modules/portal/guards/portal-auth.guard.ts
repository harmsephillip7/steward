import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException();

    try {
      const secret = this.config.get<string>('JWT_SECRET') || 'dev-secret';
      const payload = jwt.verify(auth.slice(7), secret) as any;
      if (payload.type !== 'portal') throw new UnauthorizedException('Not a portal token');
      req.portalUser = { id: payload.sub, client_id: payload.client_id };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
