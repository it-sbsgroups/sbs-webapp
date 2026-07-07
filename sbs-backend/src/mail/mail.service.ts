import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

export interface RfqItemRow {
  name: string;
  model?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  quantity: number;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');
    
    console.log(`📧 Configuring email: ${user}`);
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  }

  /**
   * Get RFQ settings from database (admin-configured templates)
   */
  private async getRfqSettings() {
    const settings = await this.prisma.rfqSettings.findFirst();
    if (!settings) {
      return {
        autoReplyEnabled: true,
        customerEmailSubject: '✅ RFQ Received: Thank you {fullName} — SBS Groups',
        customerEmailBody: 'Dear {fullName},\n\nThank you for your quotation request.\n\nWe have received your RFQ for {itemCount} item(s). Your reference number is {rfqId}.\n\nOur team will respond within 24 hours.\n\nRegards,\nSBS Groups Team',
        teamNotifyEnabled: true,
        teamEmailSubject: '🔔 New RFQ: {clientName} ({companyName}) — {itemCount} Items',
        teamEmailBody: 'New RFQ received.\n\nClient: {fullName}\nCompany: {companyName}\nEmail: {email}\nMobile: {mobile}\n\nProducts:\n{productTable}\n\nTotal: {itemCount} items',
        forwardToEmails: [],
      };
    }
    return settings;
  }

  /**
   * Replace placeholders in template with actual data
   */
  private replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template || '';
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
    }
    return result;
  }

  private escapeHtml(s: string): string {
    return (s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private nl2br(s: string): string {
    return (s || '').replace(/\r?\n/g, '<br>');
  }

  /** Styled, responsive product table for the email body. */
  private itemsTableHtml(items: RfqItemRow[]): string {
    if (!items || items.length === 0) return '';
    const rows = items
      .map((it, i) => {
        const meta = [it.brand, it.category, it.subcategory]
          .filter(Boolean)
          .join(' • ');
        return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;color:#64748b;font-size:13px;vertical-align:top">${i + 1}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;vertical-align:top">
            <div style="font-weight:700;color:#0f172a;font-size:14px">${this.escapeHtml(it.name)}</div>
            ${it.model ? `<div style="color:#64748b;font-size:12px;margin-top:2px">Model: ${this.escapeHtml(it.model)}</div>` : ''}
            ${meta ? `<div style="color:#94a3b8;font-size:12px;margin-top:2px">${this.escapeHtml(meta)}</div>` : ''}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;font-weight:700;color:#0f172a;font-size:14px;vertical-align:top">${it.quantity}</td>
        </tr>`;
      })
      .join('');
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:6px 0 4px">
        <thead>
          <tr style="background:#f8fafc">
            <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">#</th>
            <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">Product</th>
            <th align="center" style="padding:10px 12px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">Qty</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  /** Compact bulleted list variant. */
  private itemsListHtml(items: RfqItemRow[]): string {
    if (!items || items.length === 0) return '';
    const lis = items
      .map(
        (it) =>
          `<li style="margin:4px 0;color:#334155;font-size:14px"><b style="color:#0f172a">${this.escapeHtml(it.name)}</b> <span style="color:#64748b">— Qty: ${it.quantity}</span></li>`,
      )
      .join('');
    return `<ul style="margin:6px 0;padding-left:18px">${lis}</ul>`;
  }

  private emailShell(opts: {
    heading: string;
    contentHtml: string;
    accent?: string;
    preheader?: string;
  }): string {
    const accent = opts.accent || '#1e3a8a';
    return `<!doctype html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${this.escapeHtml(opts.heading)}</title></head>
    <body style="margin:0;padding:0;background:#f1f5f9">
      <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${this.escapeHtml(opts.preheader || opts.heading)}</span>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px">
        <tr><td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif">
            <tr><td style="background:#0f172a;padding:20px 28px">
              <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em">SBS <span style="color:#a3e635">GROUPS</span></span>
            </td></tr>
            <tr><td style="height:4px;background:${accent}"></td></tr>
            <tr><td style="padding:26px 28px 6px">
              <h1 style="margin:0;font-size:20px;color:#0f172a">${this.escapeHtml(opts.heading)}</h1>
            </td></tr>
            <tr><td style="padding:10px 28px 22px;color:#334155;font-size:15px;line-height:1.65">${opts.contentHtml}</td></tr>
            <tr><td style="padding:16px 28px 24px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;line-height:1.5">
              SBS Groups — Industrial B2B Supply &amp; Engineering Solutions${process.env.PUBLIC_SITE_URL ? `<br><a href="${process.env.PUBLIC_SITE_URL}" style="color:#64748b">${process.env.PUBLIC_SITE_URL.replace(/^https?:\/\//, '')}</a>` : ''}
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;
  }

  private renderTemplatedEmail(
    template: string,
    placeholders: Record<string, string>,
    items: RfqItemRow[],
    opts: { heading: string; accent?: string },
  ): string {
    const textOnly = { ...placeholders };
    delete textOnly.productTable;
    delete textOnly.productList;

    const text = this.replacePlaceholders(template || '', textOnly);
    let html = this.nl2br(this.escapeHtml(text));

    const tableHtml =
      items && items.length
        ? this.itemsTableHtml(items)
        : this.nl2br(this.escapeHtml(placeholders.productTable || ''));
    const listHtml =
      items && items.length
        ? this.itemsListHtml(items)
        : this.nl2br(this.escapeHtml(placeholders.productList || ''));

    const hasToken = /\{product(Table|List)\}/.test(template || '');

    html = html
      .replace(/\{productTable\}/g, tableHtml)
      .replace(/\{productList\}/g, listHtml);

    if (!hasToken && items && items.length) {
      html += `<div style="height:14px"></div><div style="font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;margin-bottom:6px">Requested Items</div>${tableHtml}`;
    }

    return this.emailShell({
      heading: opts.heading,
      accent: opts.accent,
      contentHtml: html,
      preheader: opts.heading,
    });
  }

  async sendCustomerAutoReply(rfqData: {
    fullName: string;
    companyName?: string;
    email: string;
    mobile: string;
    remarks?: string;
    itemCount: number;
    productList: string;
    rfqId: string;
    items?: RfqItemRow[];
  }) {
    try {
      const settings = await this.getRfqSettings();

      if (!settings.autoReplyEnabled) {
        console.log('ℹ️ Customer auto-reply is disabled in settings');
        return;
      }

      const placeholders = {
        fullName: rfqData.fullName || '',
        companyName: rfqData.companyName || '',
        email: rfqData.email || '',
        mobile: rfqData.mobile || '',
        remarks: rfqData.remarks || '',
        itemCount: String(rfqData.itemCount),
        productList: rfqData.productList || '',
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        rfqId: rfqData.rfqId || '',
      };

      const subject = this.replacePlaceholders(
        settings.customerEmailSubject || 'RFQ Received - SBS Groups',
        placeholders,
      );
      const html = this.renderTemplatedEmail(
        settings.customerEmailBody || 'Thank you for your RFQ.',
        placeholders,
        rfqData.items || [],
        { heading: 'Quotation Request Received', accent: '#1e3a8a' },
      );

      console.log(`📤 Sending customer auto-reply to: ${rfqData.email}`);
      console.log(`   Subject: ${subject}`);

      const info = await this.transporter.sendMail({
        from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
        to: rfqData.email,
        subject,
        html,
      });

      console.log(`✅ Customer auto-reply sent! Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send customer auto-reply:', error.message);
    }
  }

  async sendTeamNotification(rfqData: {
    fullName: string;
    clientName?: string;
    companyName?: string;
    email: string;
    mobile: string;
    remarks?: string;
    itemCount: number;
    productTable: string;
    rfqId: string;
    items?: RfqItemRow[];
  }) {
    try {
      const settings = await this.getRfqSettings();

      if (!settings.teamNotifyEnabled) {
        console.log('ℹ️ Team notification is disabled in settings');
        return;
      }

      const forwardEmails: string[] = [];
      const rawEmails = settings.forwardToEmails as any[];

      if (Array.isArray(rawEmails)) {
        rawEmails.forEach((entry: any) => {
          if (entry && entry.active !== false) {
            const email = typeof entry === 'string' ? entry : entry.email;
            if (email && email.includes('@')) forwardEmails.push(email);
          }
        });
      }

      if (forwardEmails.length === 0) {
        console.log('ℹ️ No active team recipients configured in settings');
        return;
      }

      const placeholders = {
        fullName: rfqData.fullName || '',
        clientName: rfqData.clientName || rfqData.fullName || '',
        companyName: rfqData.companyName || '',
        email: rfqData.email || '',
        mobile: rfqData.mobile || '',
        remarks: rfqData.remarks || '',
        itemCount: String(rfqData.itemCount),
        productTable: rfqData.productTable || '',
        productList: rfqData.productTable || '',
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        rfqId: rfqData.rfqId || '',
      };

      const subject = this.replacePlaceholders(
        settings.teamEmailSubject || 'New RFQ Received',
        placeholders,
      );
      const html = this.renderTemplatedEmail(
        settings.teamEmailBody || 'New RFQ received.',
        placeholders,
        rfqData.items || [],
        { heading: 'New RFQ Received', accent: '#e98a0f' },
      );

      console.log(`📤 Sending team notification to: ${forwardEmails.join(', ')}`);
      console.log(`   Subject: ${subject}`);

      const info = await this.transporter.sendMail({
        from: `"SBS Groups RFQ System" <${this.configService.get('SMTP_USER')}>`,
        to: forwardEmails.join(', '),
        subject,
        html,
      });

      console.log(`✅ Team notification sent! Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send team notification:', error.message);
    }
  }

  async sendTestEmail(to: string, subject: string, body: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
        to,
        subject,
        html: body.replace(/\n/g, '<br>'),
      });
      console.log(`✅ Test email sent! Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
      throw error;
    }
  }

    async sendQuotationReply(rfqData: {
    fullName: string;
    email: string;
    companyName?: string;
    rfqId: string;
    price?: string;
    discount?: string;
    emailSubject?: string;
    emailBody?: string;
    itemCount: number;
    productList: string;
    items?: RfqItemRow[];
    }) {
    try {
        const subject = rfqData.emailSubject ||
        `Quotation for RFQ ${rfqData.rfqId} — SBS Groups`;

        const intro = rfqData.emailBody
          ? this.nl2br(this.escapeHtml(rfqData.emailBody))
          : this.nl2br(
              this.escapeHtml(
                `Dear ${rfqData.fullName},\n\nThank you for your patience. Please find our quotation for RFQ ${rfqData.rfqId} below.`,
              ),
            );

        const table =
          rfqData.items && rfqData.items.length
            ? this.itemsTableHtml(rfqData.items)
            : this.nl2br(this.escapeHtml(rfqData.productList || ''));

        const priceRows = [
          rfqData.price
            ? `<tr><td style="padding:6px 0;color:#475569">Price</td><td align="right" style="padding:6px 0;font-weight:700;color:#0f172a">${this.escapeHtml(rfqData.price)}</td></tr>`
            : '',
          rfqData.discount
            ? `<tr><td style="padding:6px 0;color:#475569">Discount</td><td align="right" style="padding:6px 0;font-weight:700;color:#16a34a">${this.escapeHtml(rfqData.discount)}</td></tr>`
            : '',
        ].join('');
        const priceBox = priceRows
          ? `<div style="margin:14px 0 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;padding:6px 14px">${priceRows}</table></div>`
          : '';

        const closing = rfqData.emailBody
          ? ''
          : `<div style="height:12px"></div>${this.nl2br(this.escapeHtml('For any questions, simply reply to this email.\n\nRegards,\nSBS Groups Sales Team'))}`;

        const content = `${intro}${table ? `<div style="height:10px"></div>${table}` : ''}${priceBox}${closing}`;
        const html = this.emailShell({
          heading: `Your Quotation — RFQ ${rfqData.rfqId}`,
          accent: '#16a34a',
          contentHtml: content,
          preheader: `Your quotation from SBS Groups is ready`,
        });

        console.log(`📤 Sending quotation reply to: ${rfqData.email}`);
        console.log(`   Subject: ${subject}`);

        const info = await this.transporter.sendMail({
        from: `"SBS Groups Sales" <${this.configService.get('SMTP_USER')}>`,
        to: rfqData.email,
        subject,
        html,
        replyTo: this.configService.get('SMTP_USER'),
        });

        console.log(`✅ Quotation reply sent! Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send quotation reply:', error.message);
    }
    }

  async sendBroadcast(recipients: string[], subject: string, html: string) {
    const list = (recipients || []).filter((e) => e && e.includes('@'));
    if (list.length === 0) {
      console.log('ℹ️ sendBroadcast: no valid recipients');
      return false;
    }
    try {
      const info = await this.transporter.sendMail({
        from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
        to: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
        bcc: list,
        subject,
        html,
      });
      console.log(
        `✅ Broadcast sent to ${list.length} recipient(s)! Message ID: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Broadcast failed:', error.message);
      return false;
    }
  }

  /**
   * Sends the SAME email to each recipient ONE AT A TIME (separate `to:` each
   * time, not one bcc blast). Used where each subscriber should get their own
   * individual message. Returns { sent, failed } counts.
   */
  async sendIndividual(recipients: string[], subject: string, html: string) {
    const list = (recipients || []).filter((e) => e && e.includes('@'));
    let sent = 0;
    let failed = 0;
    for (const email of list) {
      try {
        await this.transporter.sendMail({
          from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
          to: email,
          subject,
          html,
        });
        sent++;
      } catch (error) {
        failed++;
        console.error(`❌ Individual send failed for ${email}:`, error.message);
      }
      // small gap so we don't trip the SMTP provider's rate limit
      await new Promise((r) => setTimeout(r, 250));
    }
    console.log(`✅ Individual send complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  async sendTestimonialPasscode(data: {
    email: string;
    code: string;
    companyName: string;
    expiresAt: Date;
    writeUrl?: string;
  }) {
    try {
      const link = data.writeUrl
        ? `${data.writeUrl}?code=${encodeURIComponent(data.code)}`
        : '';
      const expires = data.expiresAt.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
          <div style="background:#0f172a;padding:20px 24px;color:#fff">
            <h2 style="margin:0;font-size:18px">SBS Groups — Share Your Experience</h2>
          </div>
          <div style="padding:24px;color:#0f172a">
            <p>Hello,</p>
            <p>${data.companyName} has been invited to submit a testimonial for SBS Groups. Use the one-time passcode below:</p>
            <div style="font-size:28px;font-weight:800;letter-spacing:4px;background:#f1f5f9;border:1px dashed #94a3b8;border-radius:8px;text-align:center;padding:16px;margin:16px 0">${data.code}</div>
            ${link ? `<p style="text-align:center;margin:20px 0"><a href="${link}" style="background:#1e3a8a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700">Write Your Testimonial</a></p>` : ''}
            <p style="color:#64748b;font-size:13px">This passcode expires on <b>${expires}</b> and can be used once.</p>
          </div>
          <div style="background:#f8fafc;padding:14px 24px;color:#94a3b8;font-size:12px;text-align:center">© SBS Groups</div>
        </div>`;
      const info = await this.transporter.sendMail({
        from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
        to: data.email,
        subject: `Your testimonial passcode — SBS Groups`,
        html,
      });
      console.log(`✅ Passcode email sent to ${data.email}! Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send passcode email:', error.message);
      return false;
    }
  }

  async sendContactAutoReply(contact: {
    fullName: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const subject = `Thank you for contacting SBS Groups, ${contact.fullName}`;
    const body = `Dear ${contact.fullName},\n\nThank you for reaching out to SBS Groups.\nWe have received your message regarding "${contact.subject}" and our team will get back to you within 24 hours.\n\nFor reference, here is a copy of your message:\n\n${contact.message}\n\n\nBest regards,\nSBS Groups Team`;

    try {
      await this.transporter.sendMail({
        from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
        to: contact.email,
        subject,
        html: body.replace(/\n/g, '<br>'),
      });
      console.log(`✅ Auto-reply sent to ${contact.email}`);
    } catch (error) {
      console.error('❌ Auto-reply failed:', error.message);
    }
  }

  async sendContactReplyAndRecord(
    contactId: string,
    contactEmail: string,
    contactName: string,
    replyData: { subject?: string; emailBody?: string; sentFrom?: string },
  ) {
    const defaultSubject = `Re: Your inquiry to SBS Groups`;
    const defaultBody = `Dear ${contactName},\n\nThank you for your inquiry. Please find our response below:\n\n[Your reply here]\n\nBest regards,\nSBS Groups Team`;

    const subject = replyData.subject || defaultSubject;
  const body = replyData.emailBody || defaultBody;
  const html = body.replace(/\n/g, '<br>');
  const sentFrom = replyData.sentFrom || this.configService.get('SMTP_USER') || 'it.sbsgroups@gmail.com';

  await this.transporter.sendMail({
    from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
    to: contactEmail,
    subject,
    html,
  });

  const response = await this.prisma.contactResponse.create({
    data: {
      contactId,
      emailBody: body,
      sentFrom,
      subject,
      sentAt: new Date(),
    },
  });

  await this.prisma.contact.update({
    where: { id: contactId },
    data: { responded: true },
  });

  return response;
}
}