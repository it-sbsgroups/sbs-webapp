// src/subscribers/subscribers.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';

@Controller('subscribers')
export class SubscribersController {
  constructor(
    private prisma: PrismaService,
    private readonly subscribersService: SubscribersService,
  ) {}

  // ── Public: newsletter signup form (Footer / NewsletterModal) ─────────────
  @Public()
  @Post('subscribe')
  async subscribe(@Body() dto: CreateSubscriberDto) {
    return this.subscribersService.create(dto);
  }

  // ── Public: one-click unsubscribe link sent in every notification email ──
  @Public()
  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      return res.send('Missing unsubscribe token.');
    }

    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return res.send('Invalid or expired unsubscribe token.');
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { subscribed: false, unsubscribedAt: new Date() },
    });

    res.send(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:40px;">
          <h2 style="color:#0f172a;">✅ You have been unsubscribed</h2>
          <p style="color:#475569;">You will no longer receive marketing emails from SBS Groups.</p>
          <p><a href="/" style="color:#1e3a8a;">Return to homepage</a></p>
        </body>
      </html>
    `);
  }

  // ── Admin: subscriber stats cards (total/active/inactive/new this week) ──
  @Get('stats/overview')
  async stats() {
    return this.subscribersService.getStats();
  }

  // ── Admin: bulk delete selected rows ──────────────────────────────────────
  @Post('bulk-delete')
  async bulkDelete(@Body('ids') ids: string[]) {
    return this.subscribersService.bulkDelete(ids || []);
  }

  // ── Admin: paginated/searchable subscribers table ─────────────────────────
  @Get()
  async findAll(@Query() query: QuerySubscriberDto) {
    const { data, meta } = await this.subscribersService.findAll({
      page: query.page,
      pageSize: query.limit, // frontend calls it "limit", the service calls it "pageSize"
      search: query.search,
      subscribed: query.subscribed,
    });
    return { data, meta };
  }

  // ── Admin: single-click unsubscribe/resubscribe from the table row ────────
  @Post(':id/unsubscribe')
  async unsubscribeById(@Param('id') id: string) {
    return this.subscribersService.unsubscribeById(id);
  }

  @Post(':id/resubscribe')
  async resubscribeById(@Param('id') id: string) {
    return this.subscribersService.resubscribeById(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}
