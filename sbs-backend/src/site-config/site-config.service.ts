import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Return the stored config object for a key (e.g. 'header', 'footer').
   * If nothing has been saved yet, returns an empty object so the public site
   * can fall back to its bundled defaults instead of crashing.
   */
  async get(key: string): Promise<Record<string, any>> {
    const row = await this.prisma.siteConfig.findUnique({ where: { key } });
    return (row?.data as Record<string, any>) ?? {};
  }

  /** Create or replace the config document for a key. */
  async set(key: string, data: Record<string, any>) {
    const saved = await this.prisma.siteConfig.upsert({
      where: { key },
      create: { key, data: data as any },
      update: { data: data as any },
    });
    return saved.data;
  }
}
