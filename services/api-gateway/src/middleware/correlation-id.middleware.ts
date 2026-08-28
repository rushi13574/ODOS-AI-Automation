/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    // Attach to request object for easy access in interceptors/clients
    (req as any)['correlationId'] = correlationId;

    // Always attach to the response headers
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
