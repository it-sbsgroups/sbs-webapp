import { Body, Controller, Get, Put } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('footer')
export class FooterController {
  constructor(private readonly siteConfig: SiteConfigService) {}

  // Public: the storefront footer reads this.
  @Public()
  @Get()
  get() {
    return this.siteConfig.get('footer');
  }

  // Admin: PUT the FULL footer config object as the JSON body (logoUrl, brandText,
  // contacts, quickLinks, servicesLinks, newsletterSettings, socialLinks, styling,
  // bottomBar, …). Stored verbatim — same shape as @/data/footerData.
  @Put()
  update(@Body() body: Record<string, any>) {
    return this.siteConfig.set('footer', body);
  }
}
