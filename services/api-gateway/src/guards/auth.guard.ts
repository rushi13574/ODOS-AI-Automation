/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtSecret =
    process.env.SUPABASE_JWT_SECRET ||
    'your-super-secret-jwt-token-with-at-least-32-characters-long';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload: missing sub');
      }

      // Inject the securely validated user identity into the request
      (request as any)['userId'] = payload.sub;

      return true;
    } catch (error) {
      this.logger.warn(`Failed to validate token: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
