import { Body, Controller, Get, Put } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('header')
export class HeaderController {
  constructor(private readonly siteConfig: SiteConfigService) {}

  // Public: the storefront header reads this. Returns the stored config object
  // (or {} if nothing saved yet — frontend should keep its bundled default).
  @Public()
  @Get()
  get() {
    return this.siteConfig.get('header');
  }

  // Admin: PUT the FULL header config object as the JSON body (branding,
  // primaryNavigation, dropdownNavigation, loginSettings, mobileMenuSettings).
  // It's stored verbatim — send the same shape you use in @/data/headerData.
  @Put()
  update(@Body() body: Record<string, any>) {
    return this.siteConfig.set('header', body);
  }
}
