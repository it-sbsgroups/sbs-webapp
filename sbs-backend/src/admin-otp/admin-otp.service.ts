import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const OTP_TTL_MINUTES = 10;

@Injectable()
export class AdminOtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async request(userId: string, email: string, purpose = 'site-config') {
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const otp = await this.prisma.adminOtp.create({
      data: { userId, email, codeHash, purpose, expiresAt },
    });

    await this.mail.sendOtpVerification(email, code, OTP_TTL_MINUTES);

    return { otpId: otp.id, expiresAt: otp.expiresAt };
  }

  async verify(otpId: string, userId: string, code: string) {
    const otp = await this.prisma.adminOtp.findUnique({ where: { id: otpId } });
    if (!otp || otp.userId !== userId || otp.consumed) {
      throw new UnauthorizedException('Invalid or already-used verification code.');
    }
    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Verification code has expired. Please request a new one.');
    }
    const matches = await bcrypt.compare(code, otp.codeHash);
    if (!matches) {
      throw new UnauthorizedException('Incorrect verification code.');
    }

    await this.prisma.adminOtp.update({
      where: { id: otpId },
      data: { consumed: true, consumedAt: new Date() },
    });

    return { verified: true, otpId: otp.id };
  }

  // Used by SiteConfigOtpGuard to check a still-verified "session".
  // Previously this expired 30 minutes after verification regardless of
  // whether the admin was still logged in and actively working — causing
  // saves to silently fail mid-session. Now it stays valid for as long as
  // the admin's *current login* lasts: the OTP must have been consumed at
  // or after this login's JWT `iat` (issued-at). A fresh login always has a
  // later `iat`, so logging out and back in correctly forces re-verification
  // even if it's only been a couple of minutes.
  async isSessionValid(
    otpId: string | undefined,
    userId: string | undefined,
    purpose = 'site-config',
    sessionIatSeconds?: number,
  ) {
    if (!otpId || !userId) return false;
    const otp = await this.prisma.adminOtp.findUnique({ where: { id: otpId } });
    if (!otp || otp.userId !== userId || otp.purpose !== purpose) return false;
    if (!otp.consumed || !otp.consumedAt) return false;
    if (sessionIatSeconds) {
      const loginTime = sessionIatSeconds * 1000;
      // A little slack (5s) for clock skew between OTP consumption and JWT issuance.
      if (otp.consumedAt.getTime() < loginTime - 5000) return false;
    }
    return true;
  }
}
