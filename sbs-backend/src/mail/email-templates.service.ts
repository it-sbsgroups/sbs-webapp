// src/mail/email-templates.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TemplateData {
  subject: string;
  bodyContent: string;
  unsubscribeUrl?: string;
}

@Injectable()
export class EmailTemplatesService {
  private siteUrl: string;

  constructor(private config: ConfigService) {
    this.siteUrl = this.config.get('PUBLIC_SITE_URL')?.replace(/\/$/, '') || '';
  }

  /**
   * Build the common email shell.
   */
  private baseLayout(content: string, subject: string, unsubscribeUrl?: string): string {
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
    .body { padding:26px 28px 22px;color:#334155;font-size:15px;line-height:1.65; }
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
        <tr><td class="header"><h1>SBS <span class="tagline">GROUPS</span></h1></td></tr>
        <tr><td class="body">${content}</td></tr>
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
   * 1. RFQ Auto‑Reply (Customer)
   */
  getRfqAutoReply(data: {
    fullName: string; companyName?: string; email: string; mobile: string;
    itemCount: number; productList: string; rfqReference: string; date: string; remarks?: string;
  }): TemplateData {
    const body = `
      <h2>Quotation Request Received</h2>
      <p>Dear ${this.escapeHtml(data.fullName)},</p>
      <p>Thank you for your RFQ. We have received your request for <strong>${data.itemCount}</strong> item(s).</p>
      <p><strong>Reference:</strong> ${this.escapeHtml(data.rfqReference)}</p>
      ${data.productList ? `<p><strong>Products:</strong><br>${this.nl2br(this.escapeHtml(data.productList))}</p>` : ''}
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
    productRows: { name: string; sku?: string; model?: string; category?: string; subcategory?: string; brand?: string; qty: number }[];
    rfqReference: string; date: string; remarks?: string;
  }): TemplateData {
    const rows = data.productRows || [];
    const productTableHtml = rows.length
      ? `<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:13px;">
          <thead>
            <tr style="background:#f1f5f9;text-align:left;">
              <th style="padding:8px;border:1px solid #e2e8f0;">#</th>
              <th style="padding:8px;border:1px solid #e2e8f0;">Product</th>
              <th style="padding:8px;border:1px solid #e2e8f0;">Model</th>
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
                  <td style="padding:8px;border:1px solid #e2e8f0;">${this.escapeHtml(categoryPath || 'N/A')}</td>
                  <td style="padding:8px;border:1px solid #e2e8f0;">${this.escapeHtml(item.brand || 'N/A')}</td>
                  <td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">${item.qty}</td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>`
      : '';

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
   * 10. Product Notification (Auto / Manual)
   */
  getProductNotification(data: { productName: string; sku?: string; keyFeatures?: string; productUrl: string }): TemplateData {
    const body = `
      <h2>New Product Available</h2>
      <p>We've just added a new product to our catalog:</p>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
        <div style="font-size:17px;font-weight:700;color:#0f172a;">${this.escapeHtml(data.productName)}</div>
        ${data.sku ? `<div style="color:#64748b;font-size:13px;">SKU: ${this.escapeHtml(data.sku)}</div>` : ''}
        ${data.keyFeatures ? `<div style="color:#334155;font-size:14px;margin-top:8px;">${this.escapeHtml(data.keyFeatures)}</div>` : ''}
      </div>
      <p><a href="${data.productUrl}" style="display:inline-block;margin-top:10px;color:#1e3a8a;font-weight:700;">View Product →</a></p>
    `;
    return {
      subject: `New Product: ${data.productName} — SBS Groups`,
      bodyContent: body,
    };
  }

  /**
   * 10b. Multiple-Products Notification — one email listing several products
   * at once. Used for (a) an admin manually selecting more than one product
   * to notify about, and (b) the once-a-day batch digest mode.
   */
  getProductsBatchNotification(
    products: { name: string; sku?: string; keyFeatures?: string; productUrl: string }[],
  ): TemplateData {
    if (products.length === 1) return this.getProductNotification({
      productName: products[0].name,
      sku: products[0].sku,
      keyFeatures: products[0].keyFeatures,
      productUrl: products[0].productUrl,
    });

    const cards = products
      .map(
        (p) => `
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;">
        <div style="font-size:16px;font-weight:700;color:#0f172a;">${this.escapeHtml(p.name)}</div>
        ${p.sku ? `<div style="color:#64748b;font-size:13px;">SKU: ${this.escapeHtml(p.sku)}</div>` : ''}
        ${p.keyFeatures ? `<div style="color:#334155;font-size:14px;margin-top:6px;">${this.escapeHtml(p.keyFeatures)}</div>` : ''}
        <p><a href="${p.productUrl}" style="display:inline-block;margin-top:6px;color:#1e3a8a;font-weight:700;">View Product →</a></p>
      </div>`,
      )
      .join('');

    const body = `
      <h2>${products.length} New Products Available</h2>
      <p>Here's what we've just added to our catalog:</p>
      ${cards}
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
   * 12. Test Email (Admin Diagnostic)
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
  render(templateData: TemplateData): string {
    return this.baseLayout(templateData.bodyContent, templateData.subject, templateData.unsubscribeUrl);
  }
}