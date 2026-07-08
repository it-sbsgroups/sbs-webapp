// src/subscribers/subscribers.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('subscribers')
export class SubscribersController {
  constructor(private prisma: PrismaService) {}

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
}