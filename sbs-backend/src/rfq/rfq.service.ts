// src/rfq/rfq.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RfqIntegrationsService } from './rfq-integrations.service';
import { QuotationPdfService } from './quotation-pdf.service';
import { resolveVariantFields } from '../common/variant-resolver.util';

@Injectable()
export class RfqService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private integrations: RfqIntegrationsService,
    private quotationPdf: QuotationPdfService,
  ) {}

  // ========== CREATE RFQ ==========
  async create(data: {
    fullName: string;
    companyName?: string;
    email: string;
    mobile: string;
    address?: string;
    remarks?: string;
    customFields?: any;
    items: { productId: string; quantity: number; variantId?: string }[];
  }) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const counter = await this.prisma.rfqCounter.upsert({
      where: { date: startOfDay },
      create: { date: startOfDay, count: 0 },
      update: { count: { increment: 1 } },
    });

    const padded = String(counter.count).padStart(4, '0');
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const reference = `RFQ-${dateStr}-${padded}`;

    const rfq = await this.prisma.rfqRequest.create({
      data: {
        reference,
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        remarks: data.remarks,
        customFields: data.customFields as any,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || undefined,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { name: true } },
                subcategory: { select: { name: true } },
                brand: { select: { name: true } },
              },
            },
            variant: true,
          },
        },
      },
    });

    const productRows = rfq.items.map((item) => ({
      name: item.product.name,
      sku: item.product.sku,
      model: item.variant?.model || item.product.model || '',
      variant: item.variant?.name || '',
      category: item.product.category?.name || '',
      subcategory: item.product.subcategory?.name || '',
      brand: item.product.brand?.name || '',
      qty: item.quantity,
    }));
    const productList = rfq.items
      .map((item, i) => {
        const variantSuffix = item.variant?.name ? ` — ${item.variant.name}` : '';
        return `${i + 1}. ${item.product.name}${variantSuffix} (Qty: ${item.quantity})`;
      })
      .join('\n');

    const rfqData = {
      fullName: rfq.fullName,
      clientName: rfq.fullName,
      companyName: rfq.companyName || '',
      email: rfq.email,
      mobile: rfq.mobile,
      remarks: rfq.remarks || '',
      itemCount: rfq.items.length,
      productRows,
      productList,
      rfqReference: rfq.reference,
    };

    // Emails are best-effort and have no downstream business requirement to complete
    // before we respond, so these stay fire-and-forget.
    this.mailService.sendCustomerAutoReply(rfqData).catch((err) =>
      console.error('Customer auto-reply failed:', err.message),
    );
    this.mailService.sendTeamNotification(rfqData).catch((err) =>
      console.error('Team notification failed:', err.message),
    );

    // IMPORTANT: this is awaited (unlike the emails above). pushOnRfqCreated() never
    // throws (internally wrapped in Promise.allSettled), so this adds no error risk to
    // the response — it only guarantees the outbound call actually runs to completion
    // before the request lifecycle ends. A pure "fire-and-forget, don't await" call here
    // works fine on a persistent server, but on serverless/edge hosting (Vercel
    // Functions, Lambda, Cloud Run, etc.) the runtime can freeze or recycle the instance
    // the moment the HTTP response is sent, silently killing any promise that wasn't
    // awaited — which is exactly the "test works, real submit doesn't" pattern.
    // forwardToExternalApi() already has its own 10s axios timeout, so the worst-case
    // added latency to the RFQ response is bounded.
    await this.integrations.pushOnRfqCreated(rfq);

    return rfq;
  }

  // ========== GET ALL ==========
  async findAll(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const { status, search } = params;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (search && search.trim().length >= 2) {
      where.OR = [
        { fullName: { contains: search } },
        { companyName: { contains: search } },
        { email: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [rfqs, total] = await Promise.all([
      this.prisma.rfqRequest.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          items: { include: { product: { include: { images: { take: 1 } } }, variant: true } },
          replies: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rfqRequest.count({ where }),
    ]);

    return {
      data: rfqs,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ========== GET SINGLE RFQ ==========
  async findOne(id: string) {
    const rfq = await this.prisma.rfqRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                category: { select: { name: true } },
                subcategory: { select: { name: true } },
                brand: { select: { name: true } },
              },
            },
            variant: true,
          },
        },
        replies: true,
      },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');
    return rfq;
  }

  // ========== REPLY TO RFQ (with optional email) ==========
  async reply(
    rfqId: string,
    data: {
      note?: string;
      emailSubject?: string;
      emailBody?: string;
      sentTo?: string;
      // Legacy free-text fields — still accepted so older callers don't break.
      price?: string;
      discount?: string;
      // Structured quotation (preferred): one entry per RFQ line item.
      items?: Array<{ rfqItemId: string; unitPrice: number; discountPercent?: number }>;
      overallDiscountPercent?: number;
      termsAndConditions?: string;
      includePrivacyPolicy?: boolean;
    },
  ) {
    const rfq = await this.findOne(rfqId);
    const { structured, pdfBuffer } = await this.buildStructuredQuotation(rfq, data);

    let replyNote = data.note || '';
    if (structured) {
      replyNote = `Quotation sent — Grand Total: Rs. ${structured.grandTotal.toLocaleString('en-IN')}${data.note ? ` | ${data.note}` : ''}`;
    } else if (data.price || data.discount) {
      replyNote = [
        data.price ? `Price: ${data.price}` : '',
        data.discount ? `Discount: ${data.discount}` : '',
        data.note || '',
      ]
        .filter(Boolean)
        .join(' | ');
    }

    const updatedRfq = await this.prisma.rfqRequest.update({
      where: { id: rfqId },
      data: {
        status: 'REPLIED',
        replies: {
          create: {
            note: replyNote,
            emailBody: data.emailBody,
            emailSubject: data.emailSubject,
            sentTo: data.sentTo,
            sentAt: new Date(),
            ...(structured
              ? {
                  items: structured.items,
                  subtotal: structured.subtotal,
                  overallDiscountPercent: structured.overallDiscountPercent,
                  discountTotal: structured.discountTotal,
                  grandTotal: structured.grandTotal,
                  termsAndConditions: data.termsAndConditions,
                  includePrivacyPolicy: !!data.includePrivacyPolicy,
                }
              : {}),
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { name: true } },
                subcategory: { select: { name: true } },
                brand: { select: { name: true } },
              },
            },
            variant: true,
          },
        },
      },
    });

    // Send email only if sentTo is a valid email address
    if (data.sentTo && data.sentTo.includes('@')) {
      try {
        const productList = updatedRfq.items
          .map((item, i) => `${i + 1}. ${item.product.name} (Qty: ${item.quantity})`)
          .join('\n');

        await this.mailService.sendQuotationReply({
          fullName: updatedRfq.fullName,
          email: data.sentTo,
          emailSubject: data.emailSubject,
          companyName: updatedRfq.companyName || '',
          rfqReference: updatedRfq.reference || '',
          price: structured ? `Rs. ${structured.grandTotal.toLocaleString('en-IN')}` : (data.price || ''),
          discount: structured && structured.overallDiscountPercent
            ? `${structured.overallDiscountPercent}%`
            : (data.discount || ''),
          emailBody: data.emailBody || '',
          itemCount: updatedRfq.items.length,
          productList,
          pdfBuffer: pdfBuffer || undefined,
          pdfFilename: `SBS-Quotation-${updatedRfq.reference || updatedRfq.id}.pdf`,
        });
      } catch (error) {
        console.error('Failed to send quotation reply:', error.message);
      }
    }

    return updatedRfq;
  }

  // ========== UPDATE STATUS ==========
  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.rfqRequest.update({
      where: { id },
      data: { status: status as any },
    });
  }

  // ========== DELETE RFQ ==========
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.rfqRequest.delete({ where: { id } });
  }

  // ========== RFQ SETTINGS ==========
  async getSettings() {
    const settings = await this.prisma.rfqSettings.findFirst();
    if (!settings) {
      return this.prisma.rfqSettings.create({ data: { id: 'default' } });
    }
    return settings;
  }

  async updateSettings(data: any) {
    return this.prisma.rfqSettings.upsert({
      where: { id: 'default' },
      create: { ...data, id: 'default' },
      update: data,
    });
  }

  // ========== API KEYS ==========
  async findAllApiKeys() {
    return this.prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createApiKey(data: { name: string; permissions?: string[] }) {
    const key = `sbs_live_${this.generateKey()}`;
    return this.prisma.apiKey.create({
      data: {
        name: data.name,
        key,
        permissions: data.permissions || ['read'],
      },
    });
  }

  async deleteApiKey(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }

  async toggleApiKey(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) throw new NotFoundException('API Key not found');
    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: !apiKey.isActive },
    });
  }

  private generateKey(): string {
    const chars = 'abcdef0123456789';
    const segments = [8, 4, 4, 4, 12];
    return segments
      .map((len) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
      )
      .join('');
  }

  async verifyApiKey(apiKey: string) {
    return this.prisma.apiKey.findUnique({
      where: { key: apiKey },
    });
  }

  async logApiKeyUsage(id: string) {
    await this.prisma.apiKey.update({
      where: { id },
      data: {
        lastUsedAt: new Date(),
        requestCount: { increment: 1 },
      },
    });
  }

  // ========== QUOTATION PDF SUPPORT ==========

  /**
   * Computes per-item + overall totals server-side (never trusts client
   * math) and builds the PDF buffer. Shared by reply() and the preview
   * endpoint so both use identical logic.
   */
  private async buildStructuredQuotation(
    rfq: any,
    data: {
      items?: Array<{ rfqItemId: string; unitPrice: number; discountPercent?: number }>;
      overallDiscountPercent?: number;
      termsAndConditions?: string;
      includePrivacyPolicy?: boolean;
    },
  ): Promise<{
    structured: {
      items: any[];
      subtotal: number;
      overallDiscountPercent: number;
      discountTotal: number;
      grandTotal: number;
    } | null;
    pdfBuffer: Buffer | null;
  }> {
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return { structured: null, pdfBuffer: null };
    }

    const lineItems = data.items.map((entry) => {
      const rfqItem = rfq.items.find((it: any) => it.id === entry.rfqItemId);
      const unitPrice = Number(entry.unitPrice) || 0;
      const discountPercent = Math.min(100, Math.max(0, Number(entry.discountPercent) || 0));
      const quantity = rfqItem?.quantity || 1;
      const gross = unitPrice * quantity;
      const lineTotal = Math.round((gross - (gross * discountPercent) / 100) * 100) / 100;
      const resolved = rfqItem?.variant ? resolveVariantFields(rfqItem.product, rfqItem.variant) : null;
      const image = resolved?.images?.[0] || rfqItem?.product?.images?.[0]?.url;
      return {
        rfqItemId: entry.rfqItemId,
        productName: rfqItem?.product?.name || 'Product',
        variantName: rfqItem?.variant?.name || undefined,
        model: resolved?.model || rfqItem?.product?.model || undefined,
        brand: resolved?.brand?.name || rfqItem?.product?.brand?.name || undefined,
        image,
        sku: rfqItem?.product?.sku || undefined,
        quantity,
        unitPrice,
        discountPercent,
        lineTotal,
      };
    });

    const subtotal = Math.round(lineItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) * 100) / 100;
    const preDiscountTotal = Math.round(lineItems.reduce((sum, it) => sum + it.lineTotal, 0) * 100) / 100;
    const overallDiscountPercent = Math.min(100, Math.max(0, Number(data.overallDiscountPercent) || 0));
    const overallDiscountAmount = Math.round(((preDiscountTotal * overallDiscountPercent) / 100) * 100) / 100;
    const grandTotal = Math.round((preDiscountTotal - overallDiscountAmount) * 100) / 100;
    const discountTotal = Math.round((subtotal - grandTotal) * 100) / 100;

    const structured = { items: lineItems, subtotal, overallDiscountPercent, discountTotal, grandTotal };

    const logoUrl = await this.getLogoUrl();
    const pdfBuffer = await this.quotationPdf.buildBuffer({
      reference: rfq.reference || rfq.id,
      date: new Date(),
      customerName: rfq.fullName,
      companyName: rfq.companyName || undefined,
      email: rfq.email || undefined,
      mobile: rfq.mobile || undefined,
      items: lineItems,
      subtotal,
      overallDiscountPercent,
      discountTotal,
      grandTotal,
      termsAndConditions: data.termsAndConditions,
      privacyPolicyText: data.includePrivacyPolicy ? await this.getPrivacyPolicyText() : undefined,
      includePrivacyPolicy: !!data.includePrivacyPolicy,
      logoUrl,
    });

    return { structured, pdfBuffer };
  }

  /** Preview-only: builds the PDF from draft data without saving anything. */
  async previewQuotationPdf(rfqId: string, data: any): Promise<Buffer> {
    const rfq = await this.findOne(rfqId);
    const { pdfBuffer } = await this.buildStructuredQuotation(rfq, data);
    if (!pdfBuffer) throw new NotFoundException('No items provided for preview');
    return pdfBuffer;
  }

  // Same reasoning as EmailTemplatesService: reads the logo directly via
  // Prisma (header.branding.logoUrl) to avoid pulling in the whole
  // site-config module for one field.
  private async getLogoUrl(): Promise<string | undefined> {
    try {
      const row = await this.prisma.siteConfig.findUnique({ where: { key: 'header' } });
      const blob = row?.data as Record<string, any> | null | undefined;
      return typeof blob?.branding?.logoUrl === 'string' ? blob.branding.logoUrl : undefined;
    } catch {
      return undefined;
    }
  }

  private async getPrivacyPolicyText(): Promise<string | undefined> {
    const settings = await this.getSettings();
    return settings?.privacyPolicyText || undefined;
  }

  /** Regenerates the quotation PDF for an already-sent reply (for preview/re-download). */
  async getQuotationPdfForReply(rfqId: string, replyId: string): Promise<Buffer> {
    const reply = await this.prisma.rfqReply.findUnique({ where: { id: replyId } });
    if (!reply || reply.rfqId !== rfqId || !reply.items) {
      throw new NotFoundException('Quotation not found for this reply');
    }
    const rfq = await this.findOne(rfqId);
    const logoUrl = await this.getLogoUrl();
    return this.quotationPdf.buildBuffer({
      reference: rfq.reference || rfq.id,
      date: reply.createdAt,
      customerName: rfq.fullName,
      companyName: rfq.companyName || undefined,
      email: rfq.email || undefined,
      mobile: rfq.mobile || undefined,
      items: reply.items as any,
      subtotal: reply.subtotal || 0,
      overallDiscountPercent: reply.overallDiscountPercent || 0,
      discountTotal: reply.discountTotal || 0,
      grandTotal: reply.grandTotal || 0,
      termsAndConditions: reply.termsAndConditions || undefined,
      privacyPolicyText: reply.includePrivacyPolicy ? await this.getPrivacyPolicyText() : undefined,
      includePrivacyPolicy: reply.includePrivacyPolicy,
      logoUrl,
    });
  }
}