// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { EmailTemplatesService } from '../mail/email-templates.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private templates: EmailTemplatesService,
  ) {}

  private get siteUrl() {
    return (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  }

  /**
   * Returns active subscribers who opted into a given preference,
   * including their unsubscribe token.
   */
  private async getSubscribersWithPreference(pref: 'notifyProducts' | 'notifyNews') {
    const subs = await this.prisma.newsletterSubscriber.findMany({
      where: {
        subscribed: true,
        [pref]: true,
      },
      select: {
        email: true,
        unsubscribeToken: true,
      },
    });
    return subs.filter((s) => s.email && s.unsubscribeToken);
  }

  // ---------- New Product Notification (auto) ----------

  async notifyNewProduct(product: {
    id: string;
    name: string;
    sku?: string | null;
    slug?: string | null;
    keyFeatures?: string | null;
    description?: string | null;
  }) {
    const recipients = await this.getSubscribersWithPreference('notifyProducts');
    if (!recipients.length) return;

    const productUrl = `${this.siteUrl}/products/${product.sku || product.slug || product.id}`;
    const template = this.templates.getProductNotification({
      productName: product.name,
      sku: product.sku || undefined,
      keyFeatures: product.keyFeatures || undefined,
      productUrl,
    });

    for (const sub of recipients) {
      const unsubscribeUrl = `${this.siteUrl}/subscribers/unsubscribe?token=${sub.unsubscribeToken}`;
      const html = this.templates.render({ ...template, unsubscribeUrl });
      await this.mail.sendBroadcast([sub.email], template.subject, html);
    }

    await this.logNotification('PRODUCT', template.subject, recipients.map((r) => r.email), {
      status: 'sent',
      productIds: [product.id],
    });
  }

  // ---------- Manual Product Notification (admin triggered) ----------

  async notifyProductsManual(productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, slug: true, keyFeatures: true },
    });
    if (!products.length) return { sent: 0, failed: 0 };

    const recipients = await this.getSubscribersWithPreference('notifyProducts');
    if (!recipients.length) return { sent: 0, failed: 0 };

    let sent = 0,
      failed = 0;
    for (const sub of recipients) {
      try {
        const product = products[0];
        const productUrl = `${this.siteUrl}/products/${product.sku || product.slug || product.id}`;
        const template = this.templates.getProductNotification({
          productName: product.name,
          sku: product.sku || undefined,
          keyFeatures: product.keyFeatures || undefined,
          productUrl,
        });
        const unsubscribeUrl = `${this.siteUrl}/subscribers/unsubscribe?token=${sub.unsubscribeToken}`;
        const html = this.templates.render({ ...template, unsubscribeUrl });
        await this.mail.sendBroadcast([sub.email], template.subject, html);
        sent++;
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 250));
    }

    await this.logNotification(
      'PRODUCT',
      `${products.length} new product(s)`,
      recipients.map((r) => r.email),
      { status: failed === 0 ? 'sent' : 'partial', productIds },
    );
    return { sent, failed };
  }

  // ---------- New News Notification ----------

  async notifyNewNews(post: { id: string; title: string; slug?: string; excerpt?: string }) {
    const recipients = await this.getSubscribersWithPreference('notifyNews');
    if (!recipients.length) return;

    const articleUrl = `${this.siteUrl}/news/${post.slug}`;
    const template = this.templates.getNewsNotification({
      title: post.title,
      excerpt: post.excerpt,
      articleUrl,
    });

    for (const sub of recipients) {
      const unsubscribeUrl = `${this.siteUrl}/subscribers/unsubscribe?token=${sub.unsubscribeToken}`;
      const html = this.templates.render({ ...template, unsubscribeUrl });
      await this.mail.sendBroadcast([sub.email], template.subject, html);
    }

    await this.logNotification('NEWS', template.subject, recipients.map((r) => r.email), {
      status: 'sent',
    });
  }

  // ---------- Scheduling ----------

  @Cron('0 * * * * *')
  async processDueScheduledNotifications() {
    const due = await this.prisma.scheduledNotification.findMany({
      where: { status: 'pending', scheduledAt: { lte: new Date() } },
    });
    for (const item of due) {
      try {
        const ids = Array.isArray(item.targetIds) ? (item.targetIds as string[]) : [];
        if (item.type === 'PRODUCT') {
          await this.notifyProductsManual(ids);
        } else if (item.type === 'NEWS') {
          const posts = await this.prisma.newsPost.findMany({ where: { id: { in: ids } } });
          for (const post of posts) {
            await this.notifyNewNews(post as any);
          }
        }
        await this.prisma.scheduledNotification.update({
          where: { id: item.id },
          data: { status: 'sent', sentAt: new Date() },
        });
      } catch (e) {
        this.logger.error(`Scheduled notification ${item.id} failed: ${e.message}`);
        await this.prisma.scheduledNotification.update({
          where: { id: item.id },
          data: { status: 'failed', error: e.message },
        });
      }
    }
  }

  // ---------- Helpers ----------

  private async logNotification(
    type: string,
    subject: string,
    recipients: string[],
    extra: { status: string; productIds?: string[]; error?: string },
  ) {
    try {
      await this.prisma.notificationLog.create({
        data: {
          type,
          subject,
          recipients: recipients as any,
          status: extra.status,
          productIds: (extra.productIds ?? null) as any,
          error: extra.error ?? null,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to log notification: ${e.message}`);
    }
  }

  // Additional methods (listScheduled, cancelScheduled, listLogs) remain unchanged.
  async scheduleNotification(params: any) { /* ... */ }
  async listScheduled(type?: string) { /* ... */ }
  async cancelScheduled(id: string) { /* ... */ }
  async listLogs(query: any) { /* ... */ }
}