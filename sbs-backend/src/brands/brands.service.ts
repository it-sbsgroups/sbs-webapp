import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Brochures are stored on local disk (not Cloudinary) under <backend-root>/public/brands/brochure
// and served statically at /brands/brochure/<filename> (see ServeStaticModule in app.module.ts).
const BROCHURE_DIR = path.join(process.cwd(), 'public', 'brands', 'brochure');
const BROCHURE_URL_PREFIX = '/brands/brochure';

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

  // ============================================
  // PUBLIC LISTINGS
  // ============================================

  /**
   * Active brands for public pages, optionally filtered by isOwnBrand.
   * ownBrand: 'true' -> only own brands, 'false' -> only third-party/distributor brands, omitted -> all active brands.
   */
  async findPublic(ownBrand?: string) {
    const where: any = { isActive: true };
    if (ownBrand === 'true') where.isOwnBrand = true;
    else if (ownBrand === 'false') where.isOwnBrand = false;

    return this.prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        website: true,
        isOwnBrand: true,
        brochureUrl: true,
        brochureName: true,
        brochureSize: true,
        brochureFormat: true,
        _count: { select: { products: true } },
      },
    });
  }

  /** All active brands that have a brochure uploaded — for the public "Brochures" catalog page. */
  async findAllBrochures() {
    return this.prisma.brand.findMany({
      where: { isActive: true, brochureUrl: { not: null } },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isOwnBrand: true,
        brochureUrl: true,
        brochureName: true,
        brochureSize: true,
        brochureFormat: true,
        updatedAt: true,
      },
    });
  }

  // ============================================
  // BROCHURE UPLOAD (local disk storage under public/brands/brochure)
  // ============================================

  async uploadBrochure(brandId: string, file: Express.Multer.File) {
    const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');

    fs.mkdirSync(BROCHURE_DIR, { recursive: true });

    // Remove the previous brochure file (if any) so we don't leak orphaned files on disk.
    if (brand.brochureUrl) {
      this.deleteBrochureFile(brand.brochureUrl);
    }

    const originalExt = (file.originalname.split('.').pop() || 'pdf').toLowerCase();
    const safeBrandSlug = this.slugify(brand.name) || 'brand';
    const filename = `${safeBrandSlug}-${Date.now()}.${originalExt}`;
    const filePath = path.join(BROCHURE_DIR, filename);

    fs.writeFileSync(filePath, file.buffer);

    return this.prisma.brand.update({
      where: { id: brandId },
      data: {
        brochureUrl: `${BROCHURE_URL_PREFIX}/${filename}`,
        brochureName: file.originalname,
        brochureSize: file.size,
        brochureFormat: originalExt,
      },
    });
  }

  async deleteBrochure(brandId: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');

    if (brand.brochureUrl) {
      this.deleteBrochureFile(brand.brochureUrl);
    }

    return this.prisma.brand.update({
      where: { id: brandId },
      data: {
        brochureUrl: null,
        brochureName: null,
        brochureSize: null,
        brochureFormat: null,
      },
    });
  }

  /** Best-effort removal of a brochure file from disk given its stored public URL. */
  private deleteBrochureFile(brochureUrl: string) {
    try {
      const filename = path.basename(brochureUrl);
      const filePath = path.join(BROCHURE_DIR, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Non-fatal — an orphaned file on disk is not worth failing the request over.
    }
  }
}