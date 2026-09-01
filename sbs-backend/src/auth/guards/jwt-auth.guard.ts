import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';
import { Request } from 'express';
import {
  IS_PUBLIC_KEY,
  SESSION_COOKIE_NAME,
  isAuthDisabled,
} from '../auth.constants';
import { AuthUser } from '../decorators/current-user.decorator';
import { ApiKeysService } from '../../api-keys/api-keys.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private warnedDisabled = false;

  constructor(
    private readonly reflector: Reflector,
    private readonly apiKeys: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1) @Public() routes bypass auth entirely.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2) Transition escape hatch — remove once the frontend sends tokens.
    if (isAuthDisabled()) {
      if (!this.warnedDisabled) {
        this.logger.warn(
          '⚠️  DISABLE_AUTH=true — API authentication is OFF. Do not use in production.',
        );
        this.warnedDisabled = true;
      }
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing authentication token.');
    }

    // 3) Resolve JWT secret via 3-tier fallback (DB → .env → hardcode).
    //    ApiKeysService caches for 10 s so this is not a per-request DB hit.
    const secret = await this.apiKeys.get('JWT_SECRET');
    if (!secret) {
      this.logger.error(
        'JWT_SECRET is not set in Site Config, .env, or hardcoded fallbacks. ' +
          'All protected routes will reject until it is configured.',
      );
      throw new UnauthorizedException('Server auth is misconfigured.');
    }

    const encodedSecret = new TextEncoder().encode(secret);

    try {
      const { payload } = await jwtVerify(token, encodedSecret, {
        algorithms: ['HS256'],
      });
      // Attach verified claims so @CurrentUser() / RolesGuard can use them.
      (request as Request & { user?: AuthUser }).user =
        payload as unknown as AuthUser;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session token.');
    }
  }

  private extractToken(request: Request): string | undefined {
    const auth = request.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      return auth.slice(7).trim();
    }
    // Populated by cookie-parser middleware (added in main.ts).
    const cookies = (request as Request & { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[SESSION_COOKIE_NAME];
  }
}
