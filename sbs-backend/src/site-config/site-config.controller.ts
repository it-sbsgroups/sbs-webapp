// =============================================================================
// FILE: src/site-config/site-config.controller.ts  (NEW FILE — add to module)
// Adds the /site-config/apiKeys endpoint that the admin "API Keys" tab POSTs to.
// When an admin saves new keys, this invalidates the ApiKeysService in-memory
// cache so the new keys are picked up on the NEXT request (no server restart).
//
// Also provides a general /site-config/:key GET+PUT for any future sections
// without needing to create a separate controller per section.
// =============================================================================

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { Public } from '../auth/decorators/public.decorator';

// Allowlist — the admin panel may only write to known config sections.
const VALID_SECTIONS = new Set([
  'header', 'footer', 'branding', 'navigation',
  'contact', 'about', 'social', 'newsletter',
  'apiKeys', 'founders', 'font', 'company',
]);

@Controller('site-config')
export class SiteConfigController {
  constructor(
    private readonly siteConfig: SiteConfigService,
    private readonly apiKeys: ApiKeysService,
  ) {}

  /** GET /site-config/:section — public read (storefront uses this) */
  @Public()
  @Get(':section')
  async get(@Param('section') section: string) {
    if (!VALID_SECTIONS.has(section)) {
      throw new BadRequestException(`Unknown config section: "${section}"`);
    }
    return this.siteConfig.get(section);
  }

  /**
   * PUT /site-config/:section — admin write.
   * When the section is 'apiKeys', the in-memory credential cache is cleared
   * immediately so Cloudinary, Gemini, and JWT pick up the new values on the
   * very next request (no server restart required).
   */
  @Put(':section')
  async save(
    @Param('section') section: string,
    @Body() body: Record<string, any>,
  ) {
    if (!VALID_SECTIONS.has(section)) {
      throw new BadRequestException(`Unknown config section: "${section}"`);
    }

    const result = await this.siteConfig.set(section, body);

    // ── Instant cache invalidation for API keys ────────────────────────────
    // Without this, the old cached values stay live for up to 10 s after
    // the admin hits "Save". With this, the change is effective immediately.
    if (section === 'apiKeys') {
      this.apiKeys.invalidate(); // clears ALL keys (they'll be re-read on next use)
    }

    return result;
  }
}
