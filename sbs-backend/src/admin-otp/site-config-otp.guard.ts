import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AdminOtpService } from './admin-otp.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';

// Apply with @UseGuards(SiteConfigOtpGuard) on mutating (PUT/POST/DELETE)
// Site Config routes. Read (GET) routes stay ungated so public pages and the
// admin UI itself can still load data before OTP verification.
@Injectable()
export class SiteConfigOtpGuard implements CanActivate {
  constructor(private readonly otp: AdminOtpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    if (process.env.DISABLE_AUTH === 'true') return true;

    const otpId = request.headers['x-otp-token'] as string | undefined;
    const userId = request.user?.sub;

    const valid = await this.otp.isSessionValid(otpId, userId, 'site-config');
    if (!valid) {
      throw new UnauthorizedException(
        'OTP verification required. Please verify the code sent to your email before saving Site Config.',
      );
    }
    return true;
  }
}
