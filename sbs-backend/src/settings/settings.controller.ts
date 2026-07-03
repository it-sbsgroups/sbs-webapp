import { Controller, Get, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('products')
  getProductSettings() {
    return this.settingsService.getProductSettings();
  }

  @Put('products')
  updateProductSettings(@Body() data: any) {
    return this.settingsService.updateProductSettings(data);
  }

  @Get('ads')
  getAds() {
    return this.settingsService.getAds();
  }

  @Post('ads')
  createAd(@Body() data: any) {
    return this.settingsService.createAd(data);
  }

  @Put('ads/:id')
  updateAd(@Param('id') id: string, @Body() data: any) {
    return this.settingsService.updateAd(id, data);
  }

  @Delete('ads/:id')
  deleteAd(@Param('id') id: string) {
    return this.settingsService.deleteAd(id);
  }

  @Put('ads/:id/toggle')
  toggleAd(@Param('id') id: string) {
    return this.settingsService.toggleAd(id);
  }

  @Get('search-logs')
  getSearchLogs(@Query() query: any) {
    return this.settingsService.getSearchLogs(query);
  }

  @Public()
  @Post('search-logs')
  logSearch(@Body() data: { keyword: string; results: number; ipAddress?: string }) {
    return this.settingsService.logSearch(data.keyword, data.results, data.ipAddress);
  }

  @Delete('search-logs')
  deleteSearchLogs(@Body() data: { ids?: string[] }) {
    return this.settingsService.deleteSearchLogs(data.ids);
  }

  @Get('subscribers')
  getSubscribers(@Query() query: any) {
    return this.settingsService.getSubscribers(query);
  }

  @Post('subscribers')
  subscribe(@Body('email') email: string) {
    return this.settingsService.subscribe(email);
  }

  @Delete('subscribers/:email')
  unsubscribe(@Param('email') email: string) {
    return this.settingsService.unsubscribe(email);
  }
}