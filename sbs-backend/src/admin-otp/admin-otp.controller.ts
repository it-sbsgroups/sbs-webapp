import { Body, Controller, Post } from '@nestjs/common';
import { AdminOtpService } from './admin-otp.service';
import { CurrentUser, type AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('admin-otp')
export class AdminOtpController {
  constructor(private readonly otp: AdminOtpService) {}

  @Post('request')
  async request(@CurrentUser() user: AuthUser, @Body('purpose') purpose?: string) {
    return this.otp.request(user.sub, user.email, purpose || 'site-config');
  }

  @Post('verify')
  async verify(
    @CurrentUser() user: AuthUser,
    @Body('otpId') otpId: string,
    @Body('code') code: string,
  ) {
    return this.otp.verify(otpId, user.sub, code);
  }
}
