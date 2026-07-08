// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { EmailTemplatesService } from './email-templates.service';

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
    private templates: EmailTemplatesService,
  ) {
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    this.transporter.verify((error) => {
      if (error) console.error('❌ Email transporter error:', error.message);
      else console.log('✅ Email server ready');
    });
  }

  private async getRfqSettings() {
    const settings = await this.prisma.rfqSettings.findFirst();
    if (!settings) {
      return {
        autoReplyEnabled: true,
        customerEmailSubject: '✅ RFQ Received: Thank you {fullName} — SBS Groups',
        customerEmailBody: 'Dear {fullName},\n\nThank you for your quotation request.\n\nWe have received your RFQ for {itemCount} item(s). Your reference number is {rfqReference}.\n\nOur team will respond within 24 hours.\n\nRegards,\nSBS Groups Team',
        teamNotifyEnabled: true,
        teamEmailSubject: '🔔 New RFQ: {clientName} ({companyName}) — {itemCount} Items',
        teamEmailBody: 'New RFQ received.\n\nClient: {fullName}\nCompany: {companyName}\nEmail: {email}\nMobile: {mobile}\n\nProducts:\n{productTable}\n\nTotal: {itemCount} items',
        forwardToEmails: [],
      };
    }
    return settings;
  }

  private replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template || '';
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
    }
    return result;
  }

  // ---------- RFQ Emails ----------

  async sendCustomerAutoReply(rfqData: any) {
    const settings = await this.getRfqSettings();
    if (!settings.autoReplyEnabled) return;

    const template = this.templates.getRfqAutoReply({
      fullName: rfqData.fullName,
      companyName: rfqData.companyName,
      email: rfqData.email,
      mobile: rfqData.mobile,
      itemCount: rfqData.itemCount,
      productList: rfqData.productList || '',
      rfqReference: rfqData.rfqReference || '',
      date: new Date().toLocaleDateString('en-IN'),
      remarks: rfqData.remarks,
    });

    const subject = settings.customerEmailSubject
      ? this.replacePlaceholders(settings.customerEmailSubject, { ...rfqData, rfqReference: rfqData.rfqReference || '' })
      : template.subject;

    const html = this.templates.render({ ...template, subject });

    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: rfqData.email,
      subject,
      html,
    });
  }

  async sendTeamNotification(rfqData: any) {
    const settings = await this.getRfqSettings();
    if (!settings.teamNotifyEnabled) return;

    const forwardEmails = this.getForwardEmails(settings.forwardToEmails);
    if (!forwardEmails.length) return;

    const template = this.templates.getRfqTeamNotification({
      fullName: rfqData.fullName,
      companyName: rfqData.companyName,
      email: rfqData.email,
      mobile: rfqData.mobile,
      itemCount: rfqData.itemCount,
      productTable: rfqData.productTable || '',
      rfqReference: rfqData.rfqReference || '',
      date: new Date().toLocaleDateString('en-IN'),
      remarks: rfqData.remarks,
    });

    const subject = settings.teamEmailSubject
      ? this.replacePlaceholders(settings.teamEmailSubject, { ...rfqData, rfqReference: rfqData.rfqReference || '' })
      : template.subject;

    const html = this.templates.render({ ...template, subject });

    await this.transporter.sendMail({
      from: `"SBS Groups RFQ System" <${this.configService.get('SMTP_USER')}>`,
      to: forwardEmails.join(', '),
      subject,
      html,
    });
  }

  async sendQuotationReply(rfqData: any) {
    const template = this.templates.getRfqQuotationReply({
      fullName: rfqData.fullName,
      email: rfqData.email,
      companyName: rfqData.companyName,
      rfqReference: rfqData.rfqReference || '',
      price: rfqData.price,
      discount: rfqData.discount,
      emailBody: rfqData.emailBody || '',
      itemCount: rfqData.itemCount,
      productList: rfqData.productList || '',
    });

    const subject = rfqData.emailSubject || template.subject;
    const html = this.templates.render({ ...template, subject });

    await this.transporter.sendMail({
      from: `"SBS Groups Sales" <${this.configService.get('SMTP_USER')}>`,
      to: rfqData.email,
      subject,
      html,
      replyTo: this.configService.get('SMTP_USER'),
    });
  }

  // ---------- Contact Emails ----------

  async sendContactAutoReply(contact: { fullName: string; email: string; subject: string; message: string }) {
    const template = this.templates.getContactAutoReply({
      fullName: contact.fullName,
      subject: contact.subject,
      message: contact.message,
    });
    const html = this.templates.render(template);
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: contact.email,
      subject: template.subject,
      html,
    });
  }

  async sendContactReplyAndRecord(
    contactId: string,
    contactEmail: string,
    contactName: string,
    replyData: { subject?: string; emailBody?: string; sentFrom?: string },
  ) {
    const template = this.templates.getContactReplyManual({
      fullName: contactName,
      emailBody: replyData.emailBody || 'Thank you for your inquiry. Please find our response below.',
      subject: replyData.subject,
    });
    const html = this.templates.render(template);

    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: contactEmail,
      subject: template.subject,
      html,
    });

    const response = await this.prisma.contactResponse.create({
      data: {
        contactId,
        emailBody: replyData.emailBody || '',
        sentFrom: replyData.sentFrom || this.configService.get('SMTP_USER') || 'it.sbsgroups@gmail.com',
        subject: template.subject,
        sentAt: new Date(),
      },
    });

    await this.prisma.contact.update({
      where: { id: contactId },
      data: { responded: true },
    });

    return response;
  }

  // ---------- FAQ Emails ----------

  async sendFaqSubmissionConfirmation(data: { name: string; email: string; question: string }) {
    const template = this.templates.getFaqSubmissionAutoReply({
      name: data.name,
      question: data.question,
    });
    const html = this.templates.render(template);
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: data.email,
      subject: template.subject,
      html,
    });
  }

  async sendFaqAnswerNotification(data: { name: string; email: string; question: string; answer: string }) {
    const template = this.templates.getFaqAnswerManual({
      name: data.name,
      question: data.question,
      answer: data.answer,
    });
    const html = this.templates.render(template);
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: data.email,
      subject: template.subject,
      html,
    });
  }

  async sendFaqRejectionNotification(data: { name: string; email: string; question: string }) {
    const template = this.templates.getFaqRejectionAutoReply({
      name: data.name,
      question: data.question,
    });
    const html = this.templates.render(template);
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: data.email,
      subject: template.subject,
      html,
    });
  }

  // ---------- Testimonial Passcode ----------

  async sendTestimonialPasscode(data: { email: string; code: string; companyName: string; expiresAt: Date; writeUrl?: string }) {
    const template = this.templates.getTestimonialPasscode({
      companyName: data.companyName,
      code: data.code,
      expiresAt: data.expiresAt.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      writeUrl: data.writeUrl || `${this.configService.get('PUBLIC_SITE_URL')}/testimonials/write`,
    });
    const html = this.templates.render(template);
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: data.email,
      subject: template.subject,
      html,
    });
  }

  // ---------- Product / News Broadcasts with Unsubscribe ----------

  async sendProductNotification(subscriber: { email: string; unsubscribeToken: string }, productData: { name: string; sku?: string; keyFeatures?: string; url: string }) {
    const template = this.templates.getProductNotification({
      productName: productData.name,
      sku: productData.sku,
      keyFeatures: productData.keyFeatures,
      productUrl: productData.url,
    });
    const unsubscribeUrl = `${this.configService.get('PUBLIC_SITE_URL')}/subscribers/unsubscribe?token=${subscriber.unsubscribeToken}`;
    const html = this.templates.render({ ...template, unsubscribeUrl });
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: subscriber.email,
      subject: template.subject,
      html,
    });
  }

  async sendNewsNotification(subscriber: { email: string; unsubscribeToken: string }, newsData: { title: string; excerpt?: string; url: string }) {
    const template = this.templates.getNewsNotification({
      title: newsData.title,
      excerpt: newsData.excerpt,
      articleUrl: newsData.url,
    });
    const unsubscribeUrl = `${this.configService.get('PUBLIC_SITE_URL')}/subscribers/unsubscribe?token=${subscriber.unsubscribeToken}`;
    const html = this.templates.render({ ...template, unsubscribeUrl });
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: subscriber.email,
      subject: template.subject,
      html,
    });
  }

  // ---------- Test Email ----------

  async sendTestEmail(to: string, subject?: string, body?: string) {
    const template = this.templates.getTestEmail();
    const html = this.templates.render({ ...template, subject: subject || template.subject });
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to,
      subject: subject || template.subject,
      html: body ? body.replace(/\n/g, '<br>') : html,
    });
  }

  // ---------- Helpers ----------

  private getForwardEmails(raw: any): string[] {
    if (!Array.isArray(raw)) return [];
    const emails: string[] = [];
    for (const entry of raw) {
      const email = typeof entry === 'string' ? entry : entry?.email;
      if (email && email.includes('@') && entry?.active !== false) {
        emails.push(email);
      }
    }
    return emails;
  }

  // Legacy broadcast methods (used by notifications)
  async sendBroadcast(recipients: string[], subject: string, html: string) {
    if (!recipients.length) return;
    await this.transporter.sendMail({
      from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      to: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
      bcc: recipients,
      subject,
      html,
    });
  }

  async sendIndividual(recipients: string[], subject: string, html: string) {
    let sent = 0,
      failed = 0;
    for (const email of recipients) {
      try {
        await this.transporter.sendMail({
          from: `"SBS Groups" <${this.configService.get('SMTP_USER')}>`,
          to: email,
          subject,
          html,
        });
        sent++;
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return { sent, failed };
  }
}