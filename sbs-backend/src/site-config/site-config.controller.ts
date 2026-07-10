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
  'apiKeys', 'founders', 'font', 'company', 'homeAbout', 'homePrinciples', 'distributor',
]);

@Controller('site-config')
export class SiteConfigController {
  constructor(
    private readonly siteConfig: SiteConfigService,
    private readonly apiKeys: ApiKeysService,
  ) {}

  @Public()
  @Get(':section')
  async get(@Param('section') section: string) {
    if (!VALID_SECTIONS.has(section)) {
      throw new BadRequestException(`Unknown config section: "${section}"`);
    }
    return this.siteConfig.get(section);
  }

  @Put(':section')
  async save(
    @Param('section') section: string,
    @Body() body: Record<string, any>,
  ) {
    if (!VALID_SECTIONS.has(section)) {
      throw new BadRequestException(`Unknown config section: "${section}"`);
    }

    const result = await this.siteConfig.set(section, body);

    if (section === 'apiKeys') {
      this.apiKeys.invalidate();
    }

    return result;
  }
}
