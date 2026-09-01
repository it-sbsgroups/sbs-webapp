import { Module } from '@nestjs/common';
import { AdminOtpController } from './admin-otp.controller';
import { AdminOtpService } from './admin-otp.service';
import { SiteConfigOtpGuard } from './site-config-otp.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [AdminOtpController],
  providers: [AdminOtpService, SiteConfigOtpGuard],
  exports: [AdminOtpService, SiteConfigOtpGuard],
})
export class AdminOtpModule {}
