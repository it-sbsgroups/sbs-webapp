// FILE: src/site-config/site-config.module.ts  (FULL REPLACEMENT)
import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';  // ← NEW
import { HeaderController } from './header.controller';
import { FooterController } from './footer.controller';
import { CompanyController } from './company.controller';
import { CentralSiteController } from './central.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';       // ← NEW
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AdminOtpModule } from '../admin-otp/admin-otp.module';

@Module({
  imports: [
    PrismaModule,
    ApiKeysModule,   // gives SiteConfigController access to ApiKeysService.invalidate()
    CloudinaryModule, // gives CentralSiteController access to CloudinaryService (logo/favicon/founder/journey uploads)
    AdminOtpModule,   // gives *Controller access to SiteConfigOtpGuard
  ],
  controllers: [
    SiteConfigController,   // handles /site-config/:section (GET + PUT)
    HeaderController,       // keeps existing /header endpoints working
    FooterController,       // keeps existing /footer endpoints working
    CompanyController,      // /company (GET + PUT) — single source of truth for company details
    CentralSiteController,  // /site/:key (GET + PUT) + /site/upload/* — used by the admin About/Branding editor
  ],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
