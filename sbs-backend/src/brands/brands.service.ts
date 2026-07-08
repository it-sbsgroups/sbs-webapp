import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          take: 10,
          include: { images: { take: 1 } },
        },
        _count: { select: { products: true } },
      },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
        products: {
          where: { isActive: true },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          take: 8,
          select: {
            id: true, sku: true, name: true, slug: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
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
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(data: any) {
    const slug = this.slugify(data.name);
    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('Brand with this name already exists');
    return this.prisma.brand.create({ data: { ...data, slug } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.name) updateData.slug = this.slugify(data.name);
    return this.prisma.brand.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
  }
}