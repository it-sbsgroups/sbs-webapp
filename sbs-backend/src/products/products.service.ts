import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private notifications: NotificationsService,
  ) {}

  private readonly productInclude = {
    category: { select: { id: true, name: true, slug: true, icon: true } },
    subcategory: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, slug: true, logo: true } },
    images: { orderBy: { sortOrder: 'asc' as const } },
    specifications: true,
    certifications: true,
  };

  async findAll(query: QueryProductsDto) {
    const { page = 1, pageSize = 20, categoryId, subcategoryId, brandId, search, isActive, sortBy, sortOrder } = query;

    const where: Prisma.ProductWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (brandId) where.brandId = brandId;

    if (search && search.trim().length >= 2) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { model: { contains: search } },
        { keyFeatures: { contains: search } },
        { manufacturer: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy && ['name', 'sku', 'createdAt', 'updatedAt'].includes(sortBy)) {
      (orderBy as any)[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: pageSize,
        where,
        include: this.productInclude,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude,
    });

    if (!product) throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: this.productInclude,
    });

    if (!product) throw new NotFoundException(`Product with SKU "${sku}" not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    const sku = dto.sku || (await this.generateSku());

    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException('Category not found');

    if (dto.subcategoryId) {
      const subcategory = await this.prisma.subcategory.findFirst({
        where: { id: dto.subcategoryId, categoryId: dto.categoryId },
      });
      if (!subcategory) throw new BadRequestException('Subcategory not found or does not belong to this category');
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
      if (!brand) throw new BadRequestException('Brand not found');
    }

    const created = await this.prisma.product.create({
      data: {
        sku,
        name: dto.name,
        model: dto.model,
        description: dto.description,
        keyFeatures: dto.keyFeatures,
        material: dto.material,
        manufacturer: dto.manufacturer,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        slug: dto.slug || this.slugify(dto.name),
        keywords: dto.keywords as any,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        brandId: dto.brandId,
        images: dto.images?.length
          ? {
              create: dto.images.map((img, i) => ({
                url: img.url,
                title: img.title || '',
                angle: img.angle || '',
                altText: img.altText || '',
                sortOrder: img.sortOrder ?? i,
              })),
            }
          : undefined,
        specifications:
          dto.specifications && Object.keys(dto.specifications).length > 0
            ? {
                create: Object.entries(dto.specifications).map(([key, value]) => ({
                  key,
                  value: String(value),
                })),
              }
            : undefined,
        certifications: dto.certifications?.length
          ? {
              create: dto.certifications.map((name) => ({ name })),
            }
          : undefined,
      },
      include: this.productInclude,
    });

    // Fire-and-forget: alert subscribers who opted into new-product emails.
    // Notification failures must never block product creation.
    if (created.isActive) {
      void this.notifications.notifyNewProduct(created);
    }

    return created;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException('Category not found');
    }

    if (dto.subcategoryId && dto.categoryId) {
      const subcategory = await this.prisma.subcategory.findFirst({
        where: { id: dto.subcategoryId, categoryId: dto.categoryId },
      });
      if (!subcategory) throw new BadRequestException('Subcategory not found');
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
      if (!brand) throw new BadRequestException('Brand not found');
    }

    if (dto.images !== undefined) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
    }
    if (dto.specifications !== undefined) {
      await this.prisma.productSpecification.deleteMany({ where: { productId: id } });
    }
    if (dto.certifications !== undefined) {
      await this.prisma.productCertification.deleteMany({ where: { productId: id } });
    }

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.keyFeatures !== undefined) data.keyFeatures = dto.keyFeatures;
    if (dto.material !== undefined) data.material = dto.material;
    if (dto.manufacturer !== undefined) data.manufacturer = dto.manufacturer;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.keywords !== undefined) data.keywords = dto.keywords as any;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.subcategoryId !== undefined) data.subcategoryId = dto.subcategoryId;
    if (dto.brandId !== undefined) data.brandId = dto.brandId;

    if (dto.images?.length) {
      data.images = {
        create: dto.images.map((img, i) => ({
          url: img.url,
          title: img.title || '',
          angle: img.angle || '',
          altText: img.altText || '',
          sortOrder: img.sortOrder ?? i,
        })),
      };
    }

    if (dto.specifications && Object.keys(dto.specifications).length > 0) {
      data.specifications = {
        create: Object.entries(dto.specifications).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      };
    }

    if (dto.certifications?.length) {
      data.certifications = {
        create: dto.certifications.map((name) => ({ name })),
      };
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: this.productInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  async restore(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { isActive: true } });
  }

  async toggleFeatured(id: string) {
    const product = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
    });
  }

  async bulkImport(products: CreateProductDto[]) {
    const results: { success: number; failed: number; errors: Array<{ row: number; product: string; error: string }> } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < products.length; i++) {
      try {
        await this.create(products[i]);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          product: products[i].name,
          error: error.message,
        });
      }
    }

    return results;
  }

  async exportToCSV() {
    const products = await this.prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { take: 1 },
        specifications: true,
        certifications: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      ID: p.id,
      SKU: p.sku,
      Name: p.name,
      Model: p.model || '',
      Category: p.category?.name || '',
      Brand: p.brand?.name || '',
      Manufacturer: p.manufacturer || '',
      Material: p.material || '',
      KeyFeatures: p.keyFeatures || '',
      Certifications: p.certifications?.map((c) => c.name).join('; ') || '',
      ImageURLs: p.images?.[0]?.url || '',
      IsActive: p.isActive ? 'Yes' : 'No',
      IsFeatured: p.isFeatured ? 'Yes' : 'No',
      CreatedAt: p.createdAt.toISOString(),
    }));
  }

  async getRelated(productId: string, mode: string = 'category', limit: number = 4) {
    const product = await this.findOne(productId);
    let related: any[] = [];

    if (mode === 'category' || mode === 'subcategory') {
      related = await this.prisma.product.findMany({
        where: {
          ...(mode === 'subcategory' && product.subcategoryId
            ? { subcategoryId: product.subcategoryId }
            : { categoryId: product.categoryId }),
          id: { not: productId },
          isActive: true,
        },
        take: limit,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          brand: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (related.length < limit) {
      const moreProducts = await this.prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { notIn: [productId, ...related.map((r) => r.id)] },
          isActive: true,
        },
        take: limit - related.length,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          brand: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      related = [...related, ...moreProducts];
    }

    return related;
  }

  // ============================================
  // BROCHURE METHODS
  // ============================================

  /**
   * Compress + convert an uploaded image to WebP (<100KB) via Cloudinary.
   * Returns a payload shaped like a product image so the frontend can append
   * it straight into the form's images array.
   */
  async uploadImage(file: Express.Multer.File, productId?: string) {
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // When tied to an existing product, validate it exists and namespace the
    // Cloudinary folder by its id.
    if (productId) {
      await this.findOne(productId);
    }

    const result = await this.cloudinary.uploadProductImage(
      file,
      productId || 'unassigned',
    );

    return {
      url: result.url,
      bytes: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
      title: file.originalname?.replace(/\.[^.]+$/, '') || 'Image',
    };
  }

  async uploadBrochure(productId: string, file: Express.Multer.File) {
    const product = await this.findOne(productId);

    // Delete old brochure if exists
    if (product.brochureUrl) {
      const publicId = this.cloudinary.getPublicIdFromUrl(product.brochureUrl);
      if (publicId) {
        await this.cloudinary.deleteBrochure(publicId).catch(() => {});
      }
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('File size must be under 20MB');
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX');
    }

    // Upload to Cloudinary
    const result = await this.cloudinary.uploadBrochure(file, productId);

    // Update product with brochure info
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        brochureUrl: result.url,
        brochureName: result.name,
        brochureSize: result.size,
        brochureFormat: result.format,
      },
    });
  }

  async deleteBrochure(productId: string) {
    const product = await this.findOne(productId);

    if (product.brochureUrl) {
      const publicId = this.cloudinary.getPublicIdFromUrl(product.brochureUrl);
      if (publicId) {
        await this.cloudinary.deleteBrochure(publicId).catch(() => {});
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        brochureUrl: null,
        brochureName: null,
        brochureSize: null,
        brochureFormat: null,
      },
    });
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async generateSku(): Promise<string> {
    const count = await this.prisma.product.count();
    return `PROD-${String(count + 1).padStart(4, '0')}`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}