// src/site-config/site-config.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

  async get(key: string) {
    const record = await this.prisma.siteConfig.findUnique({ where: { key } });
    return record?.data ?? null;
  }

  async set(key: string, data: any) {
    return this.prisma.siteConfig.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
  }

  // Alias for `set` – used by site-config.controller.ts
  async save(key: string, data: any) {
    return this.set(key, data);
  }
}