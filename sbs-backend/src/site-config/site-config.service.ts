import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<Record<string, any>> {
    const row = await this.prisma.siteConfig.findUnique({ where: { key } });
    return (row?.data as Record<string, any>) ?? {};
  }

  async set(key: string, data: Record<string, any>) {
    const saved = await this.prisma.siteConfig.upsert({
      where: { key },
      create: { key, data: data as any },
      update: { data: data as any },
    });
    return saved.data;
  }
}
