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

  // ---------- Universal Notification Settings (instant vs daily batch) ----------

  async getSettings() {
    const existing = await this.prisma.notificationSettings.findFirst();
    if (existing) return existing;
    return this.prisma.notificationSettings.create({ data: { id: 'default' } });
  }

  async updateSettings(data: {
    productsMode?: string;
    productsBatchTime?: string;
    newsMode?: string;
    newsBatchTime?: string;
  }) {
    await this.getSettings(); // ensure the row exists
    return this.prisma.notificationSettings.update({ where: { id: 'default' }, data });
  }

  /** Entry point for a newly-created (active) product. Routes to instant send
   *  or into today's batch depending on the admin's chosen mode. */
  async handleNewProduct(product: {
    id: string;
    name: string;
    sku?: string | null;
    slug?: string | null;
    keyFeatures?: string | null;
    description?: string | null;
  }) {
    const settings = await this.getSettings();
    if (settings.productsMode === 'BATCH') {
      await this.addToDailyBatch('PRODUCT', product.id, settings.productsBatchTime);
    } else {
      await this.notifyNewProduct(product);
    }
  }

  /** Entry point for a newly-published news post. Same instant/batch routing. */
  async handleNewNews(post: { id: string; title: string; slug?: string; excerpt?: string }) {
    const settings = await this.getSettings();
    if (settings.newsMode === 'BATCH') {
      await this.addToDailyBatch('NEWS', post.id, settings.newsBatchTime);
    } else {
      await this.notifyNewNews(post);
    }
  }

  /**
   * Adds a target (product/news id) to today's single accumulating digest
   * row for that type, creating it if it doesn't exist yet. The existing
   * per-minute cron (processDueScheduledNotifications) sends it once
   * `scheduledAt` (today at the configured HH:mm) is reached — everything
   * added before that time goes out together; anything added after that
   * time today goes out on the very next cron tick since the time already
   * passed, rather than silently waiting for tomorrow.
   */
  private async addToDailyBatch(type: 'PRODUCT' | 'NEWS', targetId: string, batchTime: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [hh, mm] = (batchTime || '18:00').split(':').map((n) => parseInt(n, 10) || 0);
    const scheduledAt = new Date(startOfDay);
    scheduledAt.setHours(hh, mm, 0, 0);

    const existing = await this.prisma.scheduledNotification.findFirst({
      where: {
        type,
        status: 'pending',
        isDailyBatch: true,
        scheduledAt: { gte: startOfDay, lt: startOfTomorrow },
      },
    });

    if (existing) {
      const ids = Array.isArray(existing.targetIds) ? (existing.targetIds as string[]) : [];
      if (!ids.includes(targetId)) {
        await this.prisma.scheduledNotification.update({
          where: { id: existing.id },
          data: { targetIds: [...ids, targetId] as any },
        });
      }
    } else {
      await this.prisma.scheduledNotification.create({
        data: {
          type,
          targetIds: [targetId] as any,
          scheduledAt,
          isDailyBatch: true,
        },
      });
    }
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

    // Build one combined email listing every product in this batch (not just
    // the first one) — matters especially for the daily-digest batch mode,
    // where several products can land here together.
    const template = this.templates.getProductsBatchNotification(
      products.map((p) => ({
        name: p.name,
        sku: p.sku || undefined,
        keyFeatures: p.keyFeatures || undefined,
        productUrl: `${this.siteUrl}/products/${p.sku || p.slug || p.id}`,
      })),
    );

    let sent = 0,
      failed = 0;
    for (const sub of recipients) {
      try {
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
      template.subject,
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