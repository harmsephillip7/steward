import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Attaches a stable correlation ID to every request, exposes it on
 * `req.correlationId` and the `X-Correlation-Id` response header.
 * Audit log entries pick this up so a single user action can be traced
 * across multiple writes.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request & { correlationId?: string }, res: Response, next: NextFunction) {
    const incoming = (req.headers['x-correlation-id'] as string | undefined)?.trim();
    const id = incoming && incoming.length <= 64 ? incoming : randomUUID();
    req.correlationId = id;
    res.setHeader('X-Correlation-Id', id);
    next();
  }
}
