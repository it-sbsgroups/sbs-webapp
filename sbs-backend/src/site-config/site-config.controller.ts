import { UseGuards, Controller, Get, Put, Body, Param } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { SiteConfigOtpGuard } from '../admin-otp/site-config-otp.guard';

@Controller('site')
export class SiteConfigController {
  constructor(private readonly siteConfig: SiteConfigService) {}

  // ─── Branding ─────────────────────────────────────────────────
  @Get('branding')
  getBranding() {
    return this.siteConfig.get('branding');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put('branding')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  saveBranding(@Body() data: any) {
    return this.siteConfig.save('branding', data);
  }

  // ─── Contact ──────────────────────────────────────────────────
  @Get('contact')
  getContact() {
    return this.siteConfig.get('contact');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put('contact')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  saveContact(@Body() data: any) {
    return this.siteConfig.save('contact', data);
  }

  // ─── About ────────────────────────────────────────────────────
  @Get('about')
  getAbout() {
    return this.siteConfig.get('about');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put('about')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  saveAbout(@Body() data: any) {
    return this.siteConfig.save('about', data);
  }

  // ─── Founders ─────────────────────────────────────────────────
  @Get('founders')
  getFounders() {
    return this.siteConfig.get('founders');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put('founders')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  saveFounders(@Body() data: any) {
    return this.siteConfig.save('founders', data);
  }

  // ─── Home About ───────────────────────────────────────────────
  @Get('homeAbout')
  getHomeAbout() {
    return this.siteConfig.get('homeAbout');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put('homeAbout')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  saveHomeAbout(@Body() data: any) {
    return this.siteConfig.save('homeAbout', data);
  }

  // ─── Home Principles ──────────────────────────────────────────
  @Get('homePrinciples')
  getHomePrinciples() {
    return this.siteConfig.get('homePrinciples');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put('homePrinciples')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  saveHomePrinciples(@Body() data: any) {
    return this.siteConfig.save('homePrinciples', data);
  }
}