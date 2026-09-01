// FILE: src/site-config/site-config.module.ts  (FULL REPLACEMENT)
import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { HeaderController } from './header.controller';
import { FooterController } from './footer.controller';
import { CompanyController } from './company.controller';
import { CentralSiteController } from './central.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AdminOtpModule } from '../admin-otp/admin-otp.module';

// IMPORTANT: `CentralSiteController` is the ONLY controller allowed to own
// the `/site` prefix. A previous `SiteConfigController` also claimed
// `@Controller('site')` with literal routes for branding/contact/about/
// founders/homeAbout/homePrinciples. Because it was registered before
// CentralSiteController, its routes silently won for those 6 keys — and
// since its GET handlers were missing `@Public()`, every logged-out visitor
// got a 401 on those sections, which the frontend quietly swallowed into
// `{}`. Removed 2026-07-26; its write-side role restriction was preserved
// as dedicated PUT routes inside central.controller.ts. Do not re-add a
// second controller on `/site` — extend CentralSiteController instead.
@Module({
  imports: [
    PrismaModule,
    ApiKeysModule,
    CloudinaryModule, // gives CentralSiteController access to CloudinaryService (logo/favicon/founder/journey uploads)
    AdminOtpModule,   // gives *Controller access to SiteConfigOtpGuard
  ],
  controllers: [
    HeaderController,       // keeps existing /header endpoints working
    FooterController,       // keeps existing /footer endpoints working
    CompanyController,      // /company (GET + PUT) — single source of truth for company details
    CentralSiteController,  // /site/:key (GET + PUT) + /site/upload/* — single source of truth for /site
  ],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
