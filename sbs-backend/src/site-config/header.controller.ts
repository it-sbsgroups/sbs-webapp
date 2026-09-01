import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { Public } from '../auth/decorators/public.decorator';
import { SiteConfigOtpGuard } from '../admin-otp/site-config-otp.guard';

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
  @UseGuards(SiteConfigOtpGuard)
  @Put()
  update(@Body() body: Record<string, any>) {
    return this.siteConfig.set('header', body);
  }
}
