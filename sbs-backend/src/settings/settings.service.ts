import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getProductSettings() {
    const settings = await this.prisma.productSettings.findFirst();
    if (!settings) {
      return this.prisma.productSettings.create({ data: { id: 'default' } });
    }
    return settings;
  }

  async updateProductSettings(data: any) {
    return this.prisma.productSettings.upsert({
      where: { id: 'default' },
      create: { ...data, id: 'default' },
      update: data,
    });
  }

  async logSearch(keyword: string, results: number, ipAddress?: string) {
    return this.prisma.searchLog.create({
      data: { keyword, results, ipAddress },
    });
  }

  async getSearchLogs(params: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20, search } = params;
    const where: any = {};
    if (search) where.keyword = { contains: search };

    const [logs, total] = await Promise.all([
      this.prisma.searchLog.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.searchLog.count({ where }),
    ]);

    return { data: logs, meta: { total, page, pageSize } };
  }

  async deleteSearchLogs(ids?: string[]) {
    if (ids?.length) {
      return this.prisma.searchLog.deleteMany({ where: { id: { in: ids } } });
    }
    return this.prisma.searchLog.deleteMany();
  }

  async subscribe(email: string) {
    return this.prisma.subscriber.upsert({
      where: { email },
      create: { email },
      update: { isActive: true, subscribedAt: new Date() },
    });
  }

  async unsubscribe(email: string) {
    return this.prisma.subscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
  }

  async getSubscribers(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;
    const [subscribers, total] = await Promise.all([
      this.prisma.subscriber.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { subscribedAt: 'desc' },
      }),
      this.prisma.subscriber.count(),
    ]);
    return { data: subscribers, meta: { total, page, pageSize } };
  }
}