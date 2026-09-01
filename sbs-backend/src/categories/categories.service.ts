import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { name: string; image?: string; sortOrder?: number }) {
    const slug = this.slugify(data.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('Category with this name already exists');

    return this.prisma.category.create({
      data: { ...data, slug },
    });
  }

  async update(id: string, data: { name?: string; image?: string; isActive?: boolean }) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.name) updateData.slug = this.slugify(data.name);
    return this.prisma.category.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

  // ============================================
  // SUBCATEGORIES
  // ============================================
  async findAllSubcategories(categoryId?: string) {
    return this.prisma.subcategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOneSubcategory(id: string) {
    const sub = await this.prisma.subcategory.findUnique({
      where: { id },
      include: { category: true, _count: { select: { products: true } } },
    });
    if (!sub) throw new NotFoundException('Subcategory not found');
    return sub;
  }

  async createSubcategory(data: { name: string; categoryId: string; image?: string }) {
    const category = await this.prisma.category.findUnique({ 
      where: { id: data.categoryId } 
    });
    if (!category) {
      throw new BadRequestException('Category not found')
    };

    const slug = this.slugify(data.name);
    
    const existing = await this.prisma.subcategory.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Subcategory with name "${data.name}" already exists`);
    }

    return this.prisma.subcategory.create({
      data: { name: data.name, slug, categoryId: data.categoryId, image: data.image },
    });
  }

  async updateSubcategory(id: string, data: { name?: string; categoryId?: string; image?: string; isActive?: boolean }) {
    await this.findOneSubcategory(id);
    const updateData: any = { ...data };
    if (data.name) updateData.slug = this.slugify(data.name);
    return this.prisma.subcategory.update({ where: { id }, data: updateData });
  }

  async removeSubcategory(id: string) {
    await this.findOneSubcategory(id);
    return this.prisma.subcategory.delete({ where: { id } });
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
  }
}