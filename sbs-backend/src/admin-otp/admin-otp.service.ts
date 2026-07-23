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
      ' Your SBS Admin Verification Code',
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          /* Reset and base styles */
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7fc;
            -webkit-font-smoothing: antialiased;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          .container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #0b2a5c, #1a3f7a);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
          }
          .header span {
            color: #7db9ff;
          }
          .body {
            padding: 40px 32px 32px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a2a4a;
            margin: 0 0 8px 0;
          }
          .message {
            font-size: 15px;
            color: #4a5568;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .otp-box {
            background: #f0f7ff;
            border: 1px dashed #2b6cb0;
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
            margin: 24px 0;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0b2a5c;
            font-family: 'Courier New', monospace;
            background: #ffffff;
            display: inline-block;
            padding: 8px 24px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          .expiry {
            font-size: 13px;
            color: #718096;
            margin-top: 8px;
          }
          .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 28px 0 20px;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #a0aec0;
            padding: 0 32px 32px;
          }
          .footer a {
            color: #2b6cb0;
            text-decoration: none;
          }
          .footer .company {
            font-weight: 600;
            color: #4a5568;
          }
          @media (max-width: 600px) {
            .body { padding: 28px 20px; }
            .otp-code { font-size: 32px; letter-spacing: 4px; padding: 6px 16px; }
            .header h1 { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f7fc;padding:24px 12px;">
          <tr>
            <td align="center">
              <div class="container">
                <!-- Header -->
                <div class="header">
                  <h1>SBS <span>Groups</span></h1>
                </div>
                <!-- Body -->
                <div class="body">
                  <p class="greeting">Hello Admin,</p>
                  <p class="message">
                    You requested access to the <strong>Site Configuration</strong> panel.
                    Please use the one‑time verification code below to continue.
                  </p>
                  <div class="otp-box">
                    <div class="otp-code">${code}</div>
                    <div class="expiry">⏱️ This code expires in ${OTP_TTL_MINUTES} minutes</div>
                  </div>
                  <p class="message" style="font-size:14px;color:#718096;">
                    If you didn’t request this, you can safely ignore this email.
                  </p>
                  <hr class="divider" />
                  <p style="font-size:14px;color:#4a5568;margin:0;">
                    Need help? Contact our support team at
                    <a href="mailto:support@sbsgroups.co.in">support@sbsgroups.co.in</a>
                  </p>
                </div>
                <!-- Footer -->
                <div class="footer">
                  <span class="company">SBS Groups</span> &bull; Industrial Solutions &bull; © ${new Date().getFullYear()}
                  <br />
                  <span style="font-size:12px;">This is an automated message, please do not reply.</span>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
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
