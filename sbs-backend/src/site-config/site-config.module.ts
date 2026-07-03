// FILE: src/site-config/site-config.module.ts  (FULL REPLACEMENT)
import { Module } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';  // ← NEW
import { HeaderController } from './header.controller';
import { FooterController } from './footer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';       // ← NEW

@Module({
  imports: [
    PrismaModule,
    ApiKeysModule,   // gives SiteConfigController access to ApiKeysService.invalidate()
  ],
  controllers: [
    SiteConfigController,   // ← NEW  handles /site-config/:section (GET + PUT)
    HeaderController,       // keeps existing /header endpoints working
    FooterController,       // keeps existing /footer endpoints working
  ],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
