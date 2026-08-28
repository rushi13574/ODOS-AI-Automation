import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      console.log(`[DIAGNOSTIC] jwt-auth.guard.ts: Auth failed for URL: ${request.url}`);
      if (err) {
        console.log(`[DIAGNOSTIC] Error: ${err.name} - ${err.message}`);
      }
      if (info) {
        console.log(`[DIAGNOSTIC] Info: ${info.name || 'Unknown'} - ${info.message || info}`);
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
