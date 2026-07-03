import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  AskFaqDto,
  AnswerFaqDto,
  CreateAdminFaqDto,
  QueryFaqDto,
} from './dto/faq.dto';
import { FaqEntity } from './entities/faq.entity';
import { Prisma } from '@prisma/client';

function buildEmailHtml(opts: {
  heading: string;
  preheader: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

  const cta =
    opts.ctaText && opts.ctaUrl
      ? `<tr><td style="padding:8px 0 4px">
           <a href="${opts.ctaUrl}"
              style="display:inline-block;background:#1e3a8a;color:#ffffff;
                     text-decoration:none;padding:12px 26px;border-radius:8px;
                     font-weight:700;font-size:14px">
             ${opts.ctaText}
           </a>
         </td></tr>`
      : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">
    ${opts.preheader}
  </span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f1f5f9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;
                    overflow:hidden;border:1px solid #e2e8f0;
                    font-family:Arial,Helvetica,sans-serif">
        <tr>
          <td style="background:#0f172a;padding:22px 28px">
            <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em">
              SBS <span style="color:#a3e635">GROUPS</span>
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px">
            <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a">${opts.heading}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 8px;color:#334155;font-size:15px;line-height:1.6">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${opts.bodyHtml}
              ${cta}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 26px;color:#94a3b8;font-size:12px;
                     line-height:1.5;border-top:1px solid #f1f5f9">
            This email was sent because you submitted a question to SBS Groups.
            ${siteUrl ? `<br><a href="${siteUrl}" style="color:#64748b">${siteUrl}</a>` : ''}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async getPublicFaqs(query: QueryFaqDto): Promise<Pick<FaqEntity, 'id' | 'question' | 'answer' | 'createdAt' | 'updatedAt'>[]> {
    const where: Prisma.FaqWhereInput = {
      isApproved: true,
      isListedOnFaqPage: true,
      deletedAt: null,
    };

    if (query.search?.trim()) {
      where.OR = [
        { question: { contains: query.search.trim() } },
        { answer: { contains: query.search.trim() } },
      ];
    }

    return this.prisma.faq.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
        updatedAt: true,
        // PII never exposed on public endpoint
        name: false,
        email: false,
        isApproved: false,
        isListedOnFaqPage: false,
        isFeaturedInComponent: false,
        isAdminCreated: false,
        deletedAt: false,
      },
    });
  }

  async getFeaturedFaqs(): Promise<Pick<FaqEntity, 'id' | 'question' | 'answer' | 'createdAt' | 'updatedAt'>[]> {
    return this.prisma.faq.findMany({
      where: {
        isApproved: true,
        isFeaturedInComponent: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
        updatedAt: true,
        name: false,
        email: false,
        isApproved: false,
        isListedOnFaqPage: false,
        isFeaturedInComponent: false,
        isAdminCreated: false,
        deletedAt: false,
      },
    });
  }

  async submitQuestion(dto: AskFaqDto): Promise<{ message: string }> {
    const faq = await this.prisma.faq.create({
      data: {
        name: dto.name,
        email: dto.email,
        question: dto.question,
      },
    });

    this.logger.log(`FAQ #${faq.id} submitted by ${dto.email}`);
    void this.sendSubmissionConfirmation({ name: dto.name, email: dto.email, question: dto.question });

    return { message: 'Your question has been received. Our team will get back to you shortly.' };
  }

  async adminGetAll(query: QueryFaqDto): Promise<{
    data: FaqEntity[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }> {
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize) || 20, 1), 100);

    const where: Prisma.FaqWhereInput = { deletedAt: null };

    if (!query.status || query.status === 'pending') {
      where.isApproved = false;
    } else if (query.status === 'approved') {
      where.isApproved = true;
    }

    if (query.search?.trim()) {
      where.OR = [
        { question: { contains: query.search.trim() } },
        { answer:    { contains: query.search.trim() } },
        { name:      { contains: query.search.trim() } },
        { email:     { contains: query.search.trim() } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.faq.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.faq.count({ where }),
    ]);

    return {
      data: data as unknown as FaqEntity[],
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async adminFindOne(id: string): Promise<FaqEntity> {
    const faq = await this.prisma.faq.findFirst({ where: { id, deletedAt: null } });
    if (!faq) throw new NotFoundException(`FAQ with ID "${id}" not found.`);
    return faq as unknown as FaqEntity;
  }

  async respondToQuestion(id: string, dto: AnswerFaqDto): Promise<FaqEntity> {
    const faq = await this.adminFindOne(id);

    if (faq.isAdminCreated) {
      throw new BadRequestException(
        'This FAQ was created directly by an admin — there is no user to notify.',
      );
    }

    const updated = await this.prisma.faq.update({
      where: { id },
      data: {
        answer: dto.answer,
        isApproved: true,
        isListedOnFaqPage: dto.isListedOnFaqPage ?? false,
        isFeaturedInComponent: dto.isFeaturedInComponent ?? false,
      },
    });

    this.logger.log(`FAQ #${id} answered and published by admin.`);

    if (updated.email) {
      void this.sendAnswerNotification({
        name: updated.name ?? 'there',
        email: updated.email,
        question: updated.question,
        answer: dto.answer,
      });
    }

    return updated as unknown as FaqEntity;
  }

  async adminCreate(dto: CreateAdminFaqDto): Promise<FaqEntity> {
    const faq = await this.prisma.faq.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        isApproved: true,
        isAdminCreated: true,
        isListedOnFaqPage: dto.isListedOnFaqPage ?? false,
        isFeaturedInComponent: dto.isFeaturedInComponent ?? false,
      },
    });

    this.logger.log(`Admin-created FAQ #${faq.id} published.`);
    return faq as unknown as FaqEntity;
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const faq = await this.adminFindOne(id);

    await this.prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
    this.logger.log(`FAQ #${id} soft-deleted (rejected) by admin.`);

    if (faq.email && !faq.isAdminCreated) {
      void this.sendRejectionNotification({
        name: faq.name ?? 'there',
        email: faq.email,
        question: faq.question,
      });
    }

    return { message: 'FAQ has been rejected and hidden successfully.' };
  }

  private async sendSubmissionConfirmation(opts: {
    name: string;
    email: string;
    question: string;
  }): Promise<void> {
    try {
      const faqPageUrl = `${(process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '')}/contact/faqs`;
      const html = buildEmailHtml({
        heading: 'We received your question!',
        preheader: 'Thank you for reaching out — our team will answer you shortly.',
        bodyHtml: `
          <tr><td style="padding-bottom:12px">Hi <strong>${opts.name}</strong>,</td></tr>
          <tr><td style="padding-bottom:12px">
            Thank you for reaching out to <strong>SBS Groups</strong>.
            We have received your question and our team will answer it shortly.
          </td></tr>
          <tr><td style="padding:14px 16px;background:#f8fafc;border-left:4px solid #1e3a8a;
                         border-radius:4px;color:#475569;font-style:italic;margin-bottom:12px">
            "${opts.question}"
          </td></tr>
          <tr><td style="padding-top:12px">
            We typically respond within <strong>1–2 business days</strong>.
          </td></tr>
        `,
        ctaText: 'Browse our FAQ page',
        ctaUrl: faqPageUrl,
      });

      await this.mail.sendBroadcast([opts.email], 'We received your question — SBS Groups', html);
      this.logger.log(`Submission confirmation sent to ${opts.email}`);
    } catch (err: unknown) {
      this.logger.error(`Failed to send submission confirmation to ${opts.email}: ${(err as Error).message}`);
    }
  }

  private async sendAnswerNotification(opts: {
    name: string;
    email: string;
    question: string;
    answer: string;
  }): Promise<void> {
    try {
      const html = buildEmailHtml({
        heading: 'Your question has been answered!',
        preheader: 'The SBS Groups team has responded to your question.',
        bodyHtml: `
          <tr><td style="padding-bottom:12px">Hi <strong>${opts.name}</strong>,</td></tr>
          <tr><td style="padding-bottom:12px">
            Our team at <strong>SBS Groups</strong> has answered your question.
          </td></tr>
          <tr><td style="padding-bottom:6px;font-weight:700;color:#0f172a">Your question:</td></tr>
          <tr><td style="padding:12px 16px;background:#f8fafc;border-left:4px solid #94a3b8;
                         border-radius:4px;color:#475569;font-style:italic;margin-bottom:12px">
            "${opts.question}"
          </td></tr>
          <tr><td style="padding:10px 0 6px;font-weight:700;color:#0f172a">Our answer:</td></tr>
          <tr><td style="padding:14px 16px;background:#f0f9ff;border-left:4px solid #1e3a8a;
                         border-radius:4px;color:#1e293b;line-height:1.7">
            ${opts.answer}
          </td></tr>
          <tr><td style="padding-top:16px;color:#64748b;font-size:13px">
            If you have more questions, you can ask again on our FAQ page.
          </td></tr>
        `,
        ctaText: 'Browse all FAQs',
        ctaUrl: `${(process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '')}/contact/faqs`,
      });

      await this.mail.sendBroadcast([opts.email], 'Your question has been answered — SBS Groups', html);
      this.logger.log(`Answer notification sent to ${opts.email}`);
    } catch (err: unknown) {
      this.logger.error(`Failed to send answer notification to ${opts.email}: ${(err as Error).message}`);
    }
  }

  private async sendRejectionNotification(opts: {
    name: string;
    email: string;
    question: string;
  }): Promise<void> {
    try {
      const html = buildEmailHtml({
        heading: 'Update on your question',
        preheader: 'A quick update from SBS Groups regarding your recent question.',
        bodyHtml: `
          <tr><td style="padding-bottom:12px">Hi <strong>${opts.name}</strong>,</td></tr>
          <tr><td style="padding-bottom:12px">
            Thank you for reaching out to <strong>SBS Groups</strong>.
          </td></tr>
          <tr><td style="padding:14px 16px;background:#f8fafc;border-left:4px solid #94a3b8;
                         border-radius:4px;color:#475569;font-style:italic;margin-bottom:12px">
            "${opts.question}"
          </td></tr>
          <tr><td style="padding-bottom:12px">
            After reviewing your question, we found it may already be covered in our existing
            resources, or falls outside the scope of our FAQ section.
          </td></tr>
          <tr><td>
            We encourage you to browse our FAQ page or contact our team directly
            for personalised assistance.
          </td></tr>
        `,
        ctaText: 'Contact us directly',
        ctaUrl: `${(process.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, '')}/contact`,
      });

      await this.mail.sendBroadcast([opts.email], 'Update on your question — SBS Groups', html);
      this.logger.log(`Rejection notification sent to ${opts.email}`);
    } catch (err: unknown) {
      this.logger.error(`Failed to send rejection notification to ${opts.email}: ${(err as Error).message}`);
    }
  }
}