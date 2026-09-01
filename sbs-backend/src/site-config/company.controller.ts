import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { Public } from '../auth/decorators/public.decorator';
import { SiteConfigOtpGuard } from '../admin-otp/site-config-otp.guard';

/**
 * Single source of truth for company-wide details: logo (used by BOTH header and
 * footer), about-us, founder / co-founder (name + photo + bio), location, contact
 * numbers, emails, and social links. Stored verbatim in the SiteConfig 'company'
 * document.
 *
 *   GET /api/company   (public)  → the company details object (or {})
 *   PUT /api/company   (admin)   → the full company details object, stored as-is
 */
@Controller('company')
export class CompanyController {
  constructor(private readonly siteConfig: SiteConfigService) {}

  @Public()
  @Get()
  get() {
    return this.siteConfig.get('company');
  }

  @UseGuards(SiteConfigOtpGuard)
  @Put()
  update(@Body() body: Record<string, any>) {
    return this.siteConfig.set('company', body);
  }
}
