import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const OTP_TTL_MINUTES = 10;
// Once verified, the frontend keeps using the same otp id as a "session"
// header for this long before it must re-verify.
const SESSION_WINDOW_MINUTES = 30;

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

    await this.mail.sendTestEmail(
      email,
      'Your SBS Admin verification code',
      `<div style="font-family:sans-serif">
         <p>Your one-time verification code to access <strong>Site Configuration</strong> is:</p>
         <p style="font-size:28px;font-weight:800;letter-spacing:4px">${code}</p>
         <p>This code expires in ${OTP_TTL_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
       </div>`,
    );

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

  // Used by SiteConfigOtpGuard to check a still-valid "verified session"
  // sent back from the frontend as the x-otp-token header.
  async isSessionValid(otpId: string | undefined, userId: string | undefined, purpose = 'site-config') {
    if (!otpId || !userId) return false;
    const otp = await this.prisma.adminOtp.findUnique({ where: { id: otpId } });
    if (!otp || otp.userId !== userId || otp.purpose !== purpose) return false;
    if (!otp.consumed || !otp.consumedAt) return false;
    const windowEnd = new Date(otp.consumedAt.getTime() + SESSION_WINDOW_MINUTES * 60 * 1000);
    return windowEnd > new Date();
  }
}
