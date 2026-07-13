import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

  async get(key: string): Promise<any> {
    const record = await this.prisma.siteConfig.findUnique({
      where: { key },
    });
    return record?.data || {};
  }

  async save(key: string, data: any): Promise<any> {
    const record = await this.prisma.siteConfig.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
    return record.data;
  }
}