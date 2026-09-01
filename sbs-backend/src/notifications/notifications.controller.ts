import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // -------------------- Universal Settings: instant vs daily batch --------------------
  @Get('settings')
  getSettings() {
    return this.notificationsService.getSettings();
  }

  @Post('settings')
  updateSettings(@Body() data: any) {
    return this.notificationsService.updateSettings(data);
  }

  // -------------------- Products: manual, immediate, one-by-one --------------------
  @Post('products/send')
  sendProductNotification(@Body('productIds') productIds: string[]) {
    return this.notificationsService.notifyProductsManual(productIds || []);
  }

  // -------------------- Scheduling (Products or News) --------------------
  @Post('schedule')
  schedule(@Body() data: { type: 'PRODUCT' | 'NEWS'; targetIds: string[]; scheduledAt: string }) {
    return this.notificationsService.scheduleNotification({
      type: data.type,
      targetIds: data.targetIds || [],
      scheduledAt: new Date(data.scheduledAt),
    });
  }

  @Get('scheduled')
  listScheduled(@Query('type') type?: string) {
    return this.notificationsService.listScheduled(type);
  }

  @Delete('scheduled/:id')
  cancelScheduled(@Param('id') id: string) {
    return this.notificationsService.cancelScheduled(id);
  }

  // -------------------- History --------------------
  @Get('logs')
  listLogs(@Query() query: any) {
    return this.notificationsService.listLogs(query);
  }
}
