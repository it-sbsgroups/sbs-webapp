// src/rfq/rfq.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RfqIntegrationsService } from './rfq-integrations.service';

@Injectable()
export class RfqService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private integrations: RfqIntegrationsService,
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
    items: { productId: string; quantity: number }[];
  }) {
    // Generate RFQ reference
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
          },
        },
      },
    });

    // Build product tables
    const productTable = rfq.items
      .map(
        (item, i) =>
          `${i + 1}. ${item.product.name} | Model: ${item.product.model || 'N/A'} | ${item.product.category?.name || ''} > ${item.product.subcategory?.name || ''} | Brand: ${item.product.brand?.name || ''} | Qty: ${item.quantity}`,
      )
      .join('\n');
    const productList = rfq.items
      .map((item, i) => `${i + 1}. ${item.product.name} (Qty: ${item.quantity})`)
      .join('\n');

    const rfqData = {
      fullName: rfq.fullName,
      clientName: rfq.fullName,
      companyName: rfq.companyName || '',
      email: rfq.email,
      mobile: rfq.mobile,
      remarks: rfq.remarks || '',
      itemCount: rfq.items.length,
      productTable,
      productList,
      rfqReference: rfq.reference,
    };

    // Fire emails (non‑blocking)
    this.mailService.sendCustomerAutoReply(rfqData).catch((err) =>
      console.error('Customer auto-reply failed:', err.message),
    );
    this.mailService.sendTeamNotification(rfqData).catch((err) =>
      console.error('Team notification failed:', err.message),
    );

    // Outbound integrations
    this.integrations.pushOnRfqCreated(rfq).catch((err) =>
      console.error('RFQ outbound integrations failed:', err.message),
    );

    return rfq;
  }

  // ========== GET ALL (with pagination, search, filter) ==========
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
          items: { include: { product: { include: { images: { take: 1 } } } } },
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
          },
        },
        replies: true,
      },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');
    return rfq;
  }

  // ========== REPLY TO RFQ (with email) ==========
  async reply(
    rfqId: string,
    data: { note?: string; emailBody?: string; sentTo?: string; price?: string; discount?: string },
  ) {
    // Build reply note
    let replyNote = data.note || '';
    if (data.price || data.discount) {
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
            sentTo: data.sentTo,
            sentAt: new Date(),
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
          },
        },
      },
    });

    // Send quotation reply email (if recipient provided)
    if (data.sentTo && data.sentTo.includes('@')) {
      try {
        const productList = updatedRfq.items
          .map((item, i) => `${i + 1}. ${item.product.name} (Qty: ${item.quantity})`)
          .join('\n');

        await this.mailService.sendQuotationReply({
          fullName: updatedRfq.fullName,
          email: data.sentTo,
          companyName: updatedRfq.companyName || '',
          rfqReference: updatedRfq.reference || '',
          price: data.price || '',
          discount: data.discount || '',
          emailBody: data.emailBody || '',
          itemCount: updatedRfq.items.length,
          productList,
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
}
