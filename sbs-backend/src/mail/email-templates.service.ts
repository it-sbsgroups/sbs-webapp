// src/mail/email-templates.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface TemplateData {
  subject: string;
  bodyContent: string;
  unsubscribeUrl?: string;
}

@Injectable()
export class EmailTemplatesService {
  private siteUrl: string;
  private logoUrlCache: { value: string; expiresAt: number } | null = null;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.siteUrl = this.config.get('PUBLIC_SITE_URL')?.replace(/\/$/, '') || '';
  }

  /**
   * Reads the admin-configured site logo (Site Config → Logo & Branding)
   * directly via Prisma rather than SiteConfigService, to avoid a circular
   * import (MailModule ← AdminOtpModule ← SiteConfigModule → MailModule).
   * Same reasoning as ApiKeysService. Cached briefly since this runs on
   * every email send.
   */
  private async getLogoUrl(): Promise<string> {
    if (this.logoUrlCache && this.logoUrlCache.expiresAt > Date.now()) {
      return this.logoUrlCache.value;
    }
    let logoUrl = '';
    try {
      const row = await this.prisma.siteConfig.findUnique({ where: { key: 'header' } });
      const blob = row?.data as Record<string, any> | null | undefined;
      if (typeof blob?.branding?.logoUrl === 'string') logoUrl = blob.branding.logoUrl;
    } catch {
      // Fall through with an empty logo — header/watermark just won't render.
    }
    this.logoUrlCache = { value: logoUrl, expiresAt: Date.now() + 60_000 };
    return logoUrl;
  }

  /**
   * Build the common email shell.
   */
  private async baseLayout(content: string, subject: string, unsubscribeUrl?: string): Promise<string> {
    const logoUrl = await this.getLogoUrl();
    const headerBrand = logoUrl
      ? `<img src="${logoUrl}" alt="SBS Groups" height="34" style="height:34px;max-height:34px;width:auto;display:block;" />`
      : `<h1>SBS <span class="tagline">GROUPS</span></h1>`;
    // Old-school `background` attribute (still honoured by Outlook/Gmail) plus a
    // CSS fallback — a faint repeated logo behind the body content.
    const watermarkAttr = logoUrl ? ` background="${logoUrl}"` : '';
    const watermarkStyle = logoUrl
      ? `background-image:url('${logoUrl}');background-repeat:no-repeat;background-position:center;background-size:180px auto;`
      : '';
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${this.escapeHtml(subject)}</title>
  <style>
    body { margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif; }
    table { border-collapse:collapse;width:100%; }
    .container { max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0; }
    .header { background:#0f172a;padding:20px 28px;color:#ffffff; }
    .header h1 { margin:0;font-size:20px;font-weight:800;letter-spacing:-0.02em; }
    .header .tagline { color:#a3e635; }
    .body-wrap { position:relative; }
    .body { padding:26px 28px 22px;color:#334155;font-size:15px;line-height:1.65;position:relative;z-index:1; }
    .body h2 { margin:0 0 12px;font-size:20px;color:#0f172a; }
    .footer { padding:16px 28px 24px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;text-align:center; }
    .footer a { color:#64748b; }
    .unsubscribe { margin-top:12px;font-size:11px; }
    .unsubscribe a { color:#64748b; }
    @media only screen and (max-width:480px){ .body { padding:20px 16px; } }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr><td align="center">
      <table class="container" role="presentation">
        <tr><td class="header">${headerBrand}</td></tr>
        <tr><td class="body-wrap"${watermarkAttr}>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${watermarkStyle}">
            <tr><td class="body" style="background:rgba(255,255,255,0.94);">${content}</td></tr>
          </table>
        </td></tr>
        <tr><td class="footer">
          <p>SBS Groups — Industrial B2B Supply &amp; Engineering Solutions</p>
          ${this.siteUrl ? `<p><a href="${this.siteUrl}">${this.siteUrl}</a></p>` : ''}
          ${unsubscribeUrl ? `<p class="unsubscribe"><a href="${unsubscribeUrl}">Unsubscribe from these emails</a></p>` : ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private escapeHtml(s: string): string {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  private nl2br(s: string): string {
    return (s || '').replace(/\r?\n/g, '<br>');
  }

  // ----- Specific template builders -----

  /**
   * Shared itemized product table used by both the customer confirmation and
   * the team notification, so a customer sees exactly what the team sees
   * (product name linked to its live page, model, variant, category, brand, qty).
   */
  private buildProductTable(
    rows: { name: string; sku?: string; model?: string; variant?: string; category?: string; subcategory?: string; brand?: string; qty: number }[],
  ): string {
    if (!rows.length) return '';
    return `<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:13px;">
        <thead>
          <tr style="background:#f1f5f9;text-align:left;">
            <th style="padding:8px;border:1px solid #e2e8f0;">#</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Product</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Model</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Variant</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Category</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Brand</th>
            <th style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((item, i) => {
              const productUrl = item.sku ? `${this.siteUrl}/products/${encodeURIComponent(item.sku)}` : '';
              const nameCell = productUrl
                ? `<a href="${productUrl}" style="color:#1e3a8a;text-decoration:underline;font-weight:bold;">${this.escapeHtml(item.name)}</a>`
                : `<strong>${this.escapeHtml(item.name)}</strong>`;
              const categoryPath = [item.category, item.subcategory].filter(Boolean).join(' > ');
              return `<tr>
                <td style="padding:8px;border:1px solid #e2e8f0;">${i + 1}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;">${nameCell}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;">${this.escapeHtml(item.model || 'N/A')}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;">${this.escapeHtml(item.variant || '—')}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;">${this.escapeHtml(categoryPath || 'N/A')}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;">${this.escapeHtml(item.brand || 'N/A')}</td>
                <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${item.qty}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;
  }

  /**
   * 1. RFQ Auto‑Reply (Customer)
   */
  getRfqAutoReply(data: {
    fullName: string; companyName?: string; email: string; mobile: string;
    itemCount: number; productList: string;
    productRows?: { name: string; sku?: string; model?: string; variant?: string; category?: string; subcategory?: string; brand?: string; qty: number }[];
    rfqReference: string; date: string; remarks?: string;
  }): TemplateData {
    const productTableHtml = this.buildProductTable(data.productRows || []);
    const body = `
      <h2>Quotation Request Received</h2>
      <p>Dear ${this.escapeHtml(data.fullName)},</p>
      <p>Thank you for your RFQ. We have received your request for <strong>${data.itemCount}</strong> item(s).</p>
      <p><strong>Reference:</strong> ${this.escapeHtml(data.rfqReference)}</p>
      ${productTableHtml || (data.productList ? `<p><strong>Products:</strong><br>${this.nl2br(this.escapeHtml(data.productList))}</p>` : '')}
      ${data.remarks ? `<p><strong>Remarks:</strong> ${this.escapeHtml(data.remarks)}</p>` : ''}
      <p>Our team will respond within 24 hours.</p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: `RFQ Received: ${data.rfqReference} — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 2. RFQ Request (Team Notification)
   */
  getRfqTeamNotification(data: {
    fullName: string; companyName?: string; email: string; mobile: string;
    itemCount: number;
    productRows: { name: string; sku?: string; model?: string; variant?: string; category?: string; subcategory?: string; brand?: string; qty: number }[];
    rfqReference: string; date: string; remarks?: string;
  }): TemplateData {
    const productTableHtml = this.buildProductTable(data.productRows || []);

    const body = `
      <h2>New RFQ Received</h2>
      <p><strong>Client:</strong> ${this.escapeHtml(data.fullName)}${data.companyName ? ` (${this.escapeHtml(data.companyName)})` : ''}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(data.email)} | <strong>Mobile:</strong> ${this.escapeHtml(data.mobile)}</p>
      <p><strong>Reference:</strong> ${this.escapeHtml(data.rfqReference)} | <strong>Date:</strong> ${this.escapeHtml(data.date)}</p>
      ${productTableHtml}
      <p><strong>Total items:</strong> ${data.itemCount}</p>
      ${data.remarks ? `<p><strong>Remarks:</strong> ${this.escapeHtml(data.remarks)}</p>` : ''}
      <p>Please process at the earliest.</p>
    `;
    return {
      subject: `New RFQ: ${data.rfqReference} — ${data.fullName}`,
      bodyContent: body,
    };
  }

  /**
   * 3. RFQ Quotation Reply (Admin → Customer)
   */
  getRfqQuotationReply(data: {
    fullName: string; email: string; companyName?: string; rfqReference: string;
    price?: string; discount?: string; emailBody: string; itemCount: number; productList: string;
  }): TemplateData {
    const body = `
      <h2>Your Quotation — RFQ ${this.escapeHtml(data.rfqReference)}</h2>
      <p>Dear ${this.escapeHtml(data.fullName)},</p>
      <p>Thank you for your patience. Please find our quotation below:</p>
      ${data.price || data.discount ? `<table style="width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:12px 0;">
        ${data.price ? `<tr><td>Price</td><td align="right"><strong>${this.escapeHtml(data.price)}</strong></td></tr>` : ''}
        ${data.discount ? `<tr><td>Discount</td><td align="right"><strong>${this.escapeHtml(data.discount)}</strong></td></tr>` : ''}
      </table>` : ''}
      ${data.productList ? `<p><strong>Items:</strong><br>${this.nl2br(this.escapeHtml(data.productList))}</p>` : ''}
      <p>${this.nl2br(this.escapeHtml(data.emailBody || 'For any questions, simply reply to this email.'))}</p>
      <p>Regards,<br>SBS Groups Sales Team</p>
    `;
    return {
      subject: `Quotation for RFQ ${data.rfqReference} — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 4. Contact Auto‑Reply (User)
   */
  getContactAutoReply(data: { fullName: string; subject: string; message: string }): TemplateData {
    const body = `
      <h2>Thank you for contacting SBS Groups</h2>
      <p>Dear ${this.escapeHtml(data.fullName)},</p>
      <p>We have received your message regarding “${this.escapeHtml(data.subject)}” and will respond within 24 hours.</p>
      <p><strong>Your message:</strong><br>${this.nl2br(this.escapeHtml(data.message))}</p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: `Thank you for contacting SBS Groups, ${data.fullName}`,
      bodyContent: body,
    };
  }

  /**
   * 5. Contact Reply Manual (Admin → User)
   */
  getContactReplyManual(data: { fullName: string; emailBody: string; subject?: string }): TemplateData {
    const body = `
      <h2>Re: Your inquiry to SBS Groups</h2>
      <p>Dear ${this.escapeHtml(data.fullName)},</p>
      <p>${this.nl2br(this.escapeHtml(data.emailBody))}</p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: data.subject || `Re: Your inquiry to SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 6. FAQ Submission Auto‑Reply
   */
  getFaqSubmissionAutoReply(data: { name: string; question: string }): TemplateData {
    const body = `
      <h2>We received your question!</h2>
      <p>Dear ${this.escapeHtml(data.name)},</p>
      <p>Thank you for reaching out. We have received your question:</p>
      <blockquote style="border-left:4px solid #1e3a8a;background:#f8fafc;padding:12px 16px;margin:12px 0;">${this.escapeHtml(data.question)}</blockquote>
      <p>Our team will answer it shortly.</p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: 'We received your question — SBS Groups',
      bodyContent: body,
    };
  }

  /**
   * 7. FAQ Answer Manual (Admin → User)
   */
  getFaqAnswerManual(data: { name: string; question: string; answer: string }): TemplateData {
    const body = `
      <h2>Your question has been answered!</h2>
      <p>Dear ${this.escapeHtml(data.name)},</p>
      <p>Our team has answered your question:</p>
      <blockquote style="border-left:4px solid #94a3b8;background:#f8fafc;padding:12px 16px;margin:12px 0;">${this.escapeHtml(data.question)}</blockquote>
      <p><strong>Answer:</strong></p>
      <div style="background:#f0f9ff;border-left:4px solid #1e3a8a;padding:14px 16px;border-radius:4px;">${data.answer}</div>
      <p>If you have more questions, you can ask again on our FAQ page.</p>
    `;
    return {
      subject: 'Your question has been answered — SBS Groups',
      bodyContent: body,
    };
  }

  /**
   * 8. FAQ Rejection Auto‑Reply
   */
  getFaqRejectionAutoReply(data: { name: string; question: string }): TemplateData {
    const body = `
      <h2>Update on your question</h2>
      <p>Dear ${this.escapeHtml(data.name)},</p>
      <p>Thank you for reaching out. After reviewing your question, we found it may already be covered in our existing resources, or falls outside the scope of our FAQ section.</p>
      <blockquote style="border-left:4px solid #94a3b8;background:#f8fafc;padding:12px 16px;margin:12px 0;">${this.escapeHtml(data.question)}</blockquote>
      <p>We encourage you to browse our FAQ page or contact us directly for personalised assistance.</p>
    `;
    return {
      subject: 'Update on your question — SBS Groups',
      bodyContent: body,
    };
  }

  /**
   * 8b. News Comment — Received (auto-reply, awaiting moderation)
   */
  getCommentReceived(data: { name: string; postTitle: string; body: string }): TemplateData {
    const body = `
      <h2>We received your comment!</h2>
      <p>Dear ${this.escapeHtml(data.name)},</p>
      <p>Thank you for commenting on <strong>${this.escapeHtml(data.postTitle)}</strong>. Your comment is waiting for review and approval:</p>
      <blockquote style="border-left:4px solid #1e3a8a;background:#f8fafc;padding:12px 16px;margin:12px 0;">${this.escapeHtml(data.body)}</blockquote>
      <p>We'll let you know as soon as it's approved and live on the article.</p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: `We received your comment — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 8c. News Comment — Approved
   */
  getCommentApproved(data: { name: string; postTitle: string; body: string; articleUrl: string }): TemplateData {
    const body = `
      <h2>Your comment has been approved!</h2>
      <p>Dear ${this.escapeHtml(data.name)},</p>
      <p>Good news — your comment on <strong>${this.escapeHtml(data.postTitle)}</strong> has been approved and is now live:</p>
      <blockquote style="border-left:4px solid #16a34a;background:#f0fdf4;padding:12px 16px;margin:12px 0;">${this.escapeHtml(data.body)}</blockquote>
      <p><a href="${data.articleUrl}" style="display:inline-block;margin-top:6px;color:#1e3a8a;font-weight:700;">View it on the article →</a></p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: `Your comment has been approved — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 8d. News Comment — Rejected
   */
  getCommentRejected(data: { name: string; postTitle: string; body: string }): TemplateData {
    const body = `
      <h2>Update on your comment</h2>
      <p>Dear ${this.escapeHtml(data.name)},</p>
      <p>Thank you for commenting on <strong>${this.escapeHtml(data.postTitle)}</strong>. After review, we're not able to publish this comment:</p>
      <blockquote style="border-left:4px solid #94a3b8;background:#f8fafc;padding:12px 16px;margin:12px 0;">${this.escapeHtml(data.body)}</blockquote>
      <p>This is usually because a comment doesn't meet our community guidelines. You're welcome to share a revised comment on the article any time.</p>
      <p>Regards,<br>SBS Groups Team</p>
    `;
    return {
      subject: `Update on your comment — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 9. Testimonial Passcode
   */
  getTestimonialPasscode(data: { companyName: string; code: string; expiresAt: string; writeUrl: string }): TemplateData {
    const body = `
      <h2>Share Your Experience</h2>
      <p>Hello,</p>
      <p>${this.escapeHtml(data.companyName)} has been invited to submit a testimonial for SBS Groups.</p>
      <p>Your one‑time passcode:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:4px;background:#f1f5f9;border:1px dashed #94a3b8;border-radius:8px;text-align:center;padding:16px;margin:16px 0;">${this.escapeHtml(data.code)}</div>
      <p style="text-align:center;"><a href="${data.writeUrl}?code=${encodeURIComponent(data.code)}" style="background:#1e3a8a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Write Your Testimonial</a></p>
      <p style="color:#64748b;font-size:13px;">Expires: ${this.escapeHtml(data.expiresAt)}</p>
    `;
    return {
      subject: `Your testimonial passcode — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * Renders a product's specifications (key/value pairs) as a compact
   * list, used inside both single and batch product notification templates.
   */
  private renderSpecsList(specs?: { key: string; value: string }[]): string {
    if (!specs || !specs.length) return '<span style="color:#94a3b8;">—</span>';
    return specs
      .map(
        (s) =>
          `<div style="margin-bottom:3px;line-height:1.4;"><strong style="color:#0f172a;">${this.escapeHtml(
            s.key,
          )}:</strong> ${this.escapeHtml(s.value)}</div>`,
      )
      .join('');
  }

  /**
   * 10. Product Notification (Auto / Manual — single product)
   */
  getProductNotification(data: {
    productName: string;
    modelNumber?: string;
    keyFeatures?: string;
    specifications?: { key: string; value: string }[];
    productUrl: string;
  }): TemplateData {
    const specsHtml = data.specifications?.length
      ? `<table role="presentation" style="width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;">
          <tbody>
            ${data.specifications
              .map(
                (s) => `<tr>
                  <td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b;width:40%;">${this.escapeHtml(s.key)}</td>
                  <td style="padding:6px 8px;border:1px solid #e2e8f0;color:#334155;">${this.escapeHtml(s.value)}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>`
      : '';

    const body = `
      <h2>New Product Available</h2>
      <p>We've just added a new product to our catalog:</p>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
        <div style="font-size:17px;font-weight:700;color:#0f172a;">${this.escapeHtml(data.productName)}</div>
        ${data.modelNumber ? `<div style="color:#64748b;font-size:13px;">Model Number: ${this.escapeHtml(data.modelNumber)}</div>` : ''}
        ${data.keyFeatures ? `<div style="color:#334155;font-size:14px;margin-top:8px;">${this.escapeHtml(data.keyFeatures)}</div>` : ''}
        ${specsHtml}
      </div>
      <p><a href="${data.productUrl}" style="display:inline-block;margin-top:10px;color:#1e3a8a;font-weight:700;">View Product →</a></p>
    `;
    return {
      subject: `New Product: ${data.productName} — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 10b. Multiple-Products Notification / Daily Digest — one email listing
   * several products at once as a clean, responsive HTML table. Used for
   * (a) an admin manually selecting more than one product to notify about,
   * and (b) the once-a-day batch digest mode.
   */
  getProductsBatchNotification(
    products: {
      name: string;
      modelNumber?: string;
      keyFeatures?: string;
      specifications?: { key: string; value: string }[];
      productUrl: string;
    }[],
  ): TemplateData {
    if (products.length === 1) {
      return this.getProductNotification({
        productName: products[0].name,
        modelNumber: products[0].modelNumber,
        keyFeatures: products[0].keyFeatures,
        specifications: products[0].specifications,
        productUrl: products[0].productUrl,
      });
    }

    const tableRows = products
      .map(
        (p, i) => `
        <tr style="${i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;'}">
          <td style="padding:10px 8px;border:1px solid #e2e8f0;font-size:13px;color:#334155;vertical-align:top;">${i + 1}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;font-size:13px;color:#334155;font-family:monospace;vertical-align:top;white-space:nowrap;">${this.escapeHtml(p.modelNumber || 'N/A')}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;font-size:13px;vertical-align:top;">
            <a href="${p.productUrl}" style="color:#1e3a8a;text-decoration:underline;font-weight:700;">${this.escapeHtml(p.name)}</a>
          </td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;font-size:13px;color:#334155;vertical-align:top;">${p.keyFeatures ? this.escapeHtml(p.keyFeatures) : '<span style="color:#94a3b8;">—</span>'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;font-size:12px;color:#334155;vertical-align:top;">${this.renderSpecsList(p.specifications)}</td>
        </tr>`,
      )
      .join('');

    const body = `
      <h2>${products.length} New Products Available</h2>
      <p>Here's what we've just added to our catalog:</p>
      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:14px 0;min-width:480px;">
          <thead>
            <tr style="background:#0f172a;">
              <th style="padding:10px 8px;color:#ffffff;font-size:12px;text-align:left;border:1px solid #0f172a;">#</th>
              <th style="padding:10px 8px;color:#ffffff;font-size:12px;text-align:left;border:1px solid #0f172a;">Model Number</th>
              <th style="padding:10px 8px;color:#ffffff;font-size:12px;text-align:left;border:1px solid #0f172a;">Name</th>
              <th style="padding:10px 8px;color:#ffffff;font-size:12px;text-align:left;border:1px solid #0f172a;">Key Features</th>
              <th style="padding:10px 8px;color:#ffffff;font-size:12px;text-align:left;border:1px solid #0f172a;">Specifications</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <p style="font-size:12px;color:#94a3b8;">Tip: on a small screen, scroll sideways to see the full table.</p>
    `;
    return {
      subject: `${products.length} New Products — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 11. News Notification (Auto)
   */
  getNewsNotification(data: { title: string; excerpt?: string; articleUrl: string }): TemplateData {
    const body = `
      <h2>New Article Published</h2>
      <p>We've published a new article:</p>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
        <div style="font-size:17px;font-weight:700;color:#0f172a;">${this.escapeHtml(data.title)}</div>
        ${data.excerpt ? `<div style="color:#334155;font-size:14px;margin-top:8px;">${this.escapeHtml(data.excerpt)}</div>` : ''}
      </div>
      <p><a href="${data.articleUrl}" style="display:inline-block;margin-top:10px;color:#1e3a8a;font-weight:700;">Read Article →</a></p>
    `;
    return {
      subject: `News: ${data.title} — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 12. Admin OTP Verification — matches the standard notification design
   * instead of a bespoke template, per the design cleanup.
   */
  getOtpVerification(data: { code: string; ttlMinutes: number }): TemplateData {
    const body = `
      <h2>Admin Verification Code</h2>
      <p>Hello Admin,</p>
      <p>You requested access to the <strong>Site Configuration</strong> panel. Use the one-time code below to continue.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr><td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1px dashed #2b6cb0;border-radius:12px;">
            <tr><td style="padding:18px 32px;text-align:center;">
              <div style="font-size:38px;font-weight:800;letter-spacing:8px;color:#0f172a;font-family:'Courier New',monospace;">${this.escapeHtml(data.code)}</div>
              <div style="font-size:12px;color:#718096;margin-top:6px;">⏱️ Expires in ${data.ttlMinutes} minutes</div>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <p style="font-size:13px;color:#718096;">If you didn't request this, you can safely ignore this email.</p>
      <p style="font-size:14px;">Need help? Contact <a href="mailto:support@sbsgroups.co.in">support@sbsgroups.co.in</a></p>
    `;
    return {
      subject: 'Your SBS Admin Verification Code',
      bodyContent: body,
    };
  }

  /**
   * 13. Test Email (Admin Diagnostic)
   */
  getTestEmail(): TemplateData {
    const body = `
      <h2>Email Configuration Test</h2>
      <p>✅ Your email server is working correctly.</p>
      <p>This is a test message from SBS Groups.</p>
    `;
    return {
      subject: 'Test Email from SBS Groups',
      bodyContent: body,
    };
  }

  /**
   * 13. Generic Broadcast (with custom subject/body)
   */
  getBroadcast(subject: string, bodyHtml: string, unsubscribeUrl?: string): TemplateData {
    return {
      subject,
      bodyContent: bodyHtml,
      unsubscribeUrl,
    };
  }

  /**
   * Final render: combines the base layout with the content.
   */
  async render(templateData: TemplateData): Promise<string> {
    return this.baseLayout(templateData.bodyContent, templateData.subject, templateData.unsubscribeUrl);
  }
}