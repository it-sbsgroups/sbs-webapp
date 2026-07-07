import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private get siteUrl() {
    return (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  }

  /** Active subscribers who opted into a given alert type. */
  private async recipients(pref: 'notifyProducts' | 'notifyNews') {
    const where: any = { subscribed: true };
    where[pref] = true;
    const subs = await this.prisma.newsletterSubscriber.findMany({
      where,
      select: { email: true },
    });
    return subs.map((s) => s.email).filter((e): e is string => !!e);
  }

  /** Responsive, brand-styled email shell shared by all notifications. */
  private shell(opts: {
    heading: string;
    preheader: string;
    bodyHtml: string;
    ctaText?: string;
    ctaUrl?: string;
  }) {
    const cta =
      opts.ctaText && opts.ctaUrl
        ? `<tr><td style="padding:8px 0 4px"><a href="${opts.ctaUrl}" style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700;font-size:14px">${opts.ctaText}</a></td></tr>`
        : '';
    return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.heading}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${opts.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif">
        <tr><td style="background:#0f172a;padding:22px 28px">
          <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em">SBS <span style="color:#a3e635">GROUPS</span></span>
        </td></tr>
        <tr><td style="padding:28px 28px 8px">
          <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a">${opts.heading}</h1>
        </td></tr>
        <tr><td style="padding:0 28px 8px;color:#334155;font-size:15px;line-height:1.6">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${opts.bodyHtml}
            ${cta}
          </table>
        </td></tr>
        <tr><td style="padding:18px 28px 26px;color:#94a3b8;font-size:12px;line-height:1.5;border-top:1px solid #f1f5f9">
          You're receiving this because you subscribed to SBS Groups updates.
          ${this.siteUrl ? `<br><a href="${this.siteUrl}" style="color:#64748b">${this.siteUrl}</a>` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  }

  private async log(
    type: string,
    subject: string,
    recipients: string[],
    extra: { status: string; productIds?: string[]; error?: string; body?: string },
  ) {
    try {
      await this.prisma.notificationLog.create({
        data: {
          type,
          subject,
          body: extra.body ?? null,
          recipients: recipients as any,
          status: extra.status,
          productIds: (extra.productIds ?? null) as any,
          error: extra.error ?? null,
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to write NotificationLog: ${e?.message}`);
    }
  }

  // -------------------- Public API --------------------

  async notifyNewProduct(product: {
    id: string;
    name: string;
    sku?: string | null;
    slug?: string | null;
    keyFeatures?: string | null;
    description?: string | null;
  }) {
    const subject = `New Product: ${product.name} — SBS Groups`;
    try {
      const emails = await this.recipients('notifyProducts');
      if (emails.length === 0) return;

      const url = this.siteUrl
        ? `${this.siteUrl}/products/${product.sku || product.slug || ''}`
        : undefined;
      const blurb =
        product.keyFeatures || product.description || 'A new product is now available in our catalog.';

      const bodyHtml = `
        <tr><td style="padding:6px 0">We've just added a new product to the SBS Groups catalog:</td></tr>
        <tr><td style="padding:10px 0">
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px">
            <div style="font-size:17px;font-weight:700;color:#0f172a">${product.name}</div>
            ${product.sku ? `<div style="color:#64748b;font-size:13px;margin-top:2px">SKU: ${product.sku}</div>` : ''}
            <div style="color:#334155;font-size:14px;margin-top:8px">${this.truncate(blurb, 220)}</div>
          </div>
        </td></tr>`;

      const html = this.shell({
        heading: 'New Product Available',
        preheader: `${product.name} is now in our catalog`,
        bodyHtml,
        ctaText: url ? 'View Product' : undefined,
        ctaUrl: url,
      });

      const ok = await this.mail.sendBroadcast(emails, subject, html);
      await this.log('PRODUCT', subject, emails, {
        status: ok ? 'sent' : 'failed',
        productIds: [product.id],
      });
    } catch (e: any) {
      this.logger.error(`notifyNewProduct failed: ${e?.message}`);
      await this.log('PRODUCT', subject, [], { status: 'failed', error: e?.message });
    }
  }

  async notifyNewNews(post: {
    id: string;
    title: string;
    slug?: string | null;
    excerpt?: string | null;
  }) {
    const subject = `News: ${post.title} — SBS Groups`;
    try {
      const emails = await this.recipients('notifyNews');
      if (emails.length === 0) return;

      const url = this.siteUrl && post.slug ? `${this.siteUrl}/news/${post.slug}` : undefined;
      const blurb = post.excerpt || 'Read our latest update on the SBS Groups newsroom.';

      const bodyHtml = `
        <tr><td style="padding:6px 0">A new article has been published on the SBS Groups newsroom:</td></tr>
        <tr><td style="padding:10px 0">
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px">
            <div style="font-size:17px;font-weight:700;color:#0f172a">${post.title}</div>
            <div style="color:#334155;font-size:14px;margin-top:8px">${this.truncate(blurb, 240)}</div>
          </div>
        </td></tr>`;

      const html = this.shell({
        heading: 'New Article Published',
        preheader: post.title,
        bodyHtml,
        ctaText: url ? 'Read Article' : undefined,
        ctaUrl: url,
      });

      const ok = await this.mail.sendBroadcast(emails, subject, html);
      await this.log('NEWS', subject, emails, { status: ok ? 'sent' : 'failed' });
    } catch (e: any) {
      this.logger.error(`notifyNewNews failed: ${e?.message}`);
      await this.log('NEWS', subject, [], { status: 'failed', error: e?.message });
    }
  }

  private truncate(s: string, n: number) {
    const clean = (s || '').replace(/<[^>]*>/g, '').trim();
    return clean.length > n ? clean.slice(0, n - 1) + '…' : clean;
  }

  // -------------------- Manual send (admin-triggered, one-by-one) --------------------

  /** Admin hits "Send Now" on the Products page for one or more products. */
  async notifyProductsManual(productIds: string[]) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, slug: true, keyFeatures: true, description: true },
    });
    if (products.length === 0) return { sent: 0, failed: 0 };

    const subject =
      products.length === 1
        ? `New Product: ${products[0].name} — SBS Groups`
        : `${products.length} New Products — SBS Groups`;

    const rows = products
      .map((p) => {
        const url = this.siteUrl ? `${this.siteUrl}/products/${p.sku || p.slug || p.id}` : '#';
        const blurb = this.truncate(p.keyFeatures || p.description || 'Now available in our catalog.', 160);
        return `<tr><td style="padding:10px 0">
          <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px">
            <div style="font-size:16px;font-weight:700;color:#0f172a">${p.name}</div>
            ${p.sku ? `<div style="color:#64748b;font-size:13px;margin-top:2px">SKU: ${p.sku}</div>` : ''}
            <div style="color:#334155;font-size:14px;margin-top:8px">${blurb}</div>
            <a href="${url}" style="display:inline-block;margin-top:10px;color:#1e3a8a;font-size:13px;font-weight:700">View Product →</a>
          </div>
        </td></tr>`;
      })
      .join('');

    const html = this.shell({
      heading: products.length === 1 ? 'New Product Available' : 'New Products Available',
      preheader: subject,
      bodyHtml: rows,
    });

    const emails = await this.recipients('notifyProducts');
    const result = await this.mail.sendIndividual(emails, subject, html);
    await this.log('PRODUCT', subject, emails, {
      status: result.failed === 0 ? 'sent' : 'partial',
      productIds: products.map((p) => p.id),
    });
    return result;
  }

  // -------------------- Scheduling (manual OR bulk, one-by-one at send time) --------------------

  async scheduleNotification(params: { type: 'PRODUCT' | 'NEWS'; targetIds: string[]; scheduledAt: Date }) {
    return this.prisma.scheduledNotification.create({
      data: {
        type: params.type,
        targetIds: params.targetIds as any,
        scheduledAt: params.scheduledAt,
      },
    });
  }

  async listScheduled(type?: string) {
    return this.prisma.scheduledNotification.findMany({
      where: type ? { type } : {},
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async cancelScheduled(id: string) {
    return this.prisma.scheduledNotification.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  /** Runs every minute; sends any scheduled notification whose time has come. */
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
      } catch (e: any) {
        this.logger.error(`Scheduled notification ${item.id} failed: ${e?.message}`);
        await this.prisma.scheduledNotification.update({
          where: { id: item.id },
          data: { status: 'failed', error: e?.message },
        });
      }
    }
  }

  /** Admin: paginated notification history. */
  async listLogs(params: { type?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const where = params.type ? { type: params.type } : {};
    const [data, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notificationLog.count({ where }),
    ]);
    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }
}
