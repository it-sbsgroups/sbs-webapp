import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';

@Controller('system-logs')
export class SystemLogsController {
  constructor(private readonly systemLogs: SystemLogsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.systemLogs.findAll(query);
  }

  @Post()
  create(@Body() body: { level?: 'INFO' | 'WARN' | 'ERROR'; source: string; message: string; meta?: any }) {
    return this.systemLogs.log(body.level || 'INFO', body.source, body.message, body.meta);
  }

  @Put(':id/review')
  markReviewed(@Param('id') id: string) {
    return this.systemLogs.markReviewed(id);
  }

  @Put(':id/unreview')
  markUnreviewed(@Param('id') id: string) {
    return this.systemLogs.markUnreviewed(id);
  }

  @Put('review-all')
  markAllReviewed() {
    return this.systemLogs.markAllReviewed();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemLogs.remove(id);
  }
}
