// src/subscribers/subscribers.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class SubscribersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new subscriber (newsletter signup).
   * Auto‑generates a unique unsubscribe token.
   */
  async create(data: {
    email: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    mobile?: string;
    whatsapp?: string;
    notifyProducts?: boolean;
    notifyNews?: boolean;
  }) {
    // Check if email already exists
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      // If exists but unsubscribed, reactivate it
      if (!existing.subscribed) {
        return this.prisma.newsletterSubscriber.update({
          where: { email: data.email },
          data: {
            subscribed: true,
            unsubscribedAt: null,
            notifyProducts: data.notifyProducts ?? true,
            notifyNews: data.notifyNews ?? true,
            // keep existing token
          },
        });
      }
      throw new ConflictException('Email already subscribed');
    }

    const token = randomBytes(32).toString('hex');
    return this.prisma.newsletterSubscriber.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        mobile: data.mobile,
        whatsapp: data.whatsapp,
        subscribed: true,
        notifyProducts: data.notifyProducts ?? true,
        notifyNews: data.notifyNews ?? true,
        unsubscribeToken: token,
      },
    });
  }

  /**
   * Get all subscribers (admin) with pagination and search.
   */
  async findAll(params: { page?: number; pageSize?: number; search?: string; subscribed?: boolean }) {
    const { page = 1, pageSize = 20, search, subscribed } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }
    if (subscribed !== undefined) {
      where.subscribed = subscribed;
    }

    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get a single subscriber by ID (admin).
   */
  async findOne(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) throw new NotFoundException(`Subscriber #${id} not found`);
    return subscriber;
  }

  /**
   * Update subscriber preferences or details (admin).
   */
  async update(id: string, data: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    mobile?: string;
    whatsapp?: string;
    subscribed?: boolean;
    notifyProducts?: boolean;
    notifyNews?: boolean;
  }) {
    await this.findOne(id);
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data,
    });
  }

  /**
   * Unsubscribe by email (used by public unsubscribe link).
   * This sets subscribed = false and records unsubscribedAt.
   */
  async unsubscribeByEmail(email: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { subscribed: false, unsubscribedAt: new Date() },
    });
  }

  /**
   * Unsubscribe by token (used by the public unsubscribe route).
   */
  async unsubscribeByToken(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!subscriber) throw new NotFoundException('Invalid or expired token');
    return this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { subscribed: false, unsubscribedAt: new Date() },
    });
  }

  /**
   * Resubscribe a previously unsubscribed email.
   */
  async resubscribe(email: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { subscribed: true, unsubscribedAt: null },
    });
  }

  /**
   * Delete a subscriber permanently (admin).
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }

  /**
   * Bulk delete subscribers by IDs.
   */
  async bulkDelete(ids: string[]) {
    return this.prisma.newsletterSubscriber.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * Get stats: total, active, inactive, new this week.
   */
  async getStats() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, active, inactive, lastWeekNew] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
      this.prisma.newsletterSubscriber.count({ where: { subscribed: false } }),
      this.prisma.newsletterSubscriber.count({
        where: { createdAt: { gte: weekAgo } },
      }),
    ]);

    return { total, active, inactive, lastWeekNew };
  }
}