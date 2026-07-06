import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Ensure a unique slug, appending -2, -3, … on collision. */
  private async uniqueSlug(base: string, ignoreId?: string) {
    const root = this.slugify(base) || 'client';
    let slug = root;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.client.findUnique({ where: { slug } });
      if (!existing || existing.id === ignoreId) return slug;
      n += 1;
      slug = `${root}-${n}`;
    }
  }

  // ---- Public ----

  findActive() {
    return this.prisma.client.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { companyName: 'asc' }],
      // Don't leak the contact's personal email/phone on the public site.
      select: {
        id: true,
        slug: true,
        companyName: true,
        companyAddress: true,
        logo: true,
        website: true,
        gallery: true,
        order: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const client = await this.prisma.client.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        companyName: true,
        companyAddress: true,
        logo: true,
        website: true,
        gallery: true,
        isActive: true,
        testimonials: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            designation: true,
            testimony: true,
            createdAt: true,
          },
        },
      },
    });
    if (!client || !client.isActive) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  // ---- Admin ----

  findAll() {
    return this.prisma.client.findMany({
      orderBy: [{ order: 'asc' }, { companyName: 'asc' }],
      include: { _count: { select: { testimonials: true } } },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { testimonials: true, testimonialPasscodes: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(dto: CreateClientDto) {
    if (!dto.companyName?.trim()) {
      throw new BadRequestException('companyName is required');
    }
    if (!dto.contactName?.trim()) {
      throw new BadRequestException('contactName is required');
    }
    if (!dto.email?.trim()) {
      throw new BadRequestException('email is required');
    }
    if (!dto.phone?.trim()) {
      throw new BadRequestException('phone is required');
    }
    const slug = await this.uniqueSlug(dto.slug || dto.companyName);
    return this.prisma.client.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.slug || dto.companyName) {
      data.slug = await this.uniqueSlug(dto.slug || dto.companyName!, id);
    }
    return this.prisma.client.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.client.delete({ where: { id } });
    return { success: true };
  }

  async toggleActive(id: string) {
    const client = await this.findOne(id);
    return this.prisma.client.update({
      where: { id },
      data: { isActive: !client.isActive },
    });
  }
}
