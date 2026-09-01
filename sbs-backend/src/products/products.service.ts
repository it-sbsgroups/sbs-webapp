// sbs-backend/src/products/products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GeminiService } from '../gemini/gemini.service';
import { CreateProductDto } from './dto/create-product.dto';
import { resolveVariantFields } from '../common/variant-resolver.util';

interface VariantWriteInput {
  name: string;
  attributes: Record<string, string>;
  model?: string;
  description?: string;
  keyFeatures?: string;
  specifications?: { key: string; value: string }[];
  images?: string[];
  brandId?: string | null;
  applicationIds?: string[];
  brochureUrl?: string; brochureName?: string; brochureSize?: number; brochureFormat?: string;
  brochurePublicId?: string; brochureResourceType?: string;
  designFileUrl?: string; designFileName?: string; designFileSize?: number; designFileFormat?: string;
  designFilePublicId?: string; designFileResourceType?: string;
  isActive?: boolean;
  sortOrder?: number;
}
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplicationsService } from '../applications/applications.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp'; // <-- default import
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private gemini: GeminiService,
    private notifications: NotificationsService,
    private applicationsService: ApplicationsService,
  ) {}

  private readonly productInclude = {
    category: { select: { id: true, name: true, slug: true } },
    subcategory: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, slug: true, logo: true } },
    images: { orderBy: { sortOrder: 'asc' as const } },
    specifications: true,
    certifications: true,
    applications: { select: { id: true, name: true, isActive: true } },
    variants: {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' as const },
      include: {
        brand: { select: { id: true, name: true, logo: true, slug: true } },
        applications: { select: { id: true, name: true, isActive: true } },
      },
    },
  };

  /**
   * MySQL/MariaDB's default collation (utf8mb4_general_ci / similar) is
   * case-insensitive, but the `specifications` unique index is enforced by
   * the DB, not by JS. A form (or the Gemini brochure-extraction merge) can
   * easily end up with two *distinct* JS object keys — e.g. "Weight" and
   * "weight" — that the database considers identical for
   * @@unique([productId, key]). Inserting both in the same create/update
   * throws P2002 and the whole save fails with a 500.
   *
   * This normalizes + dedupes specs case-insensitively before they ever
   * reach Prisma, keeping the *last* value for any colliding key (last
   * write wins, matching how the form's own state merging behaves) and
   * trimming stray whitespace on both key and value.
   */
  private dedupeSpecifications(specs?: Record<string, string>): [string, string][] {
    if (!specs) return [];
    const byLowerKey = new Map<string, [string, string]>();
    for (const [rawKey, rawValue] of Object.entries(specs)) {
      const key = String(rawKey).trim();
      const value = String(rawValue).trim();
      if (!key) continue;
      byLowerKey.set(key.toLowerCase(), [key, value]);
    }
    return Array.from(byLowerKey.values());
  }

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

    // Resolves the mixed id/name refs into concrete rows, creating any
    // brand-new custom application names the admin typed on the fly.
    const applicationRefs = dto.applications?.length
      ? await this.applicationsService.findOrCreateByRefs(dto.applications)
      : [];

    const createData = {
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
        isPrelaunch: dto.isPrelaunch ?? false,
        launchDate: dto.launchDate ? new Date(dto.launchDate) : undefined,
        prelaunchTeaser: dto.prelaunchTeaser,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        slug: dto.slug || this.slugify(dto.name),
        keywords: dto.keywords as any,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        brandId: dto.brandId,
        videoUrl: dto.videoUrl, // 👈 added this line
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
        specifications: (() => {
          const specEntries = this.dedupeSpecifications(dto.specifications);
          return specEntries.length > 0
            ? { create: specEntries.map(([key, value]) => ({ key, value })) }
            : undefined;
        })(),
        certifications: dto.certifications?.length
          ? {
              create: dto.certifications.map((name) => ({ name })),
            }
          : undefined,
        applications: applicationRefs.length
          ? { connect: applicationRefs }
          : undefined,
      },
      include: this.productInclude,
    };

    let created;
    try {
      created = await this.prisma.product.create(createData);
    } catch (err) {
      throw this.toFriendlyPrismaError(err, dto.sku);
    }

    // Fire-and-forget: alert subscribers who opted into new-product emails.
    // Notification failures must never block product creation.
    if (created.isActive) {
      void this.notifications.handleNewProduct(created);
    }

    return created;
  }

  /**
   * Turns a raw PrismaClientKnownRequestError (P2002 unique-constraint
   * violations in particular) into a clean 400 the admin UI can actually
   * show, instead of the generic 500 "Internal server error".
   */
  private toFriendlyPrismaError(err: unknown, sku?: string) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const target = (err.meta?.target as string[] | string | undefined) ?? '';
      const targetStr = Array.isArray(target) ? target.join(', ') : String(target);

      if (targetStr.includes('product_specifications')) {
        return new BadRequestException(
          'Two specification rows resolved to the same key (specification keys are case-insensitive, e.g. "Weight" and "weight" collide). Please use unique specification names.',
        );
      }
      if (targetStr.includes('sku')) {
        return new BadRequestException(`SKU "${sku}" is already in use by another product.`);
      }
      if (targetStr.includes('slug')) {
        return new BadRequestException('A product with this name/slug already exists. Please choose a different name or set a custom slug.');
      }
      return new BadRequestException(`A record with the same ${targetStr || 'value'} already exists.`);
    }
    return err;
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

    // Resolves the mixed id/name refs into concrete rows, creating any
    // brand-new custom application names the admin typed on the fly.
    const applicationRefs =
      dto.applications !== undefined
        ? await this.applicationsService.findOrCreateByRefs(dto.applications)
        : undefined;

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.keyFeatures !== undefined) data.keyFeatures = dto.keyFeatures;
    if (dto.material !== undefined) data.material = dto.material;
    if (dto.manufacturer !== undefined) data.manufacturer = dto.manufacturer;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.isPrelaunch !== undefined) data.isPrelaunch = dto.isPrelaunch;
    if (dto.launchDate !== undefined) data.launchDate = dto.launchDate ? new Date(dto.launchDate) : null;
    if (dto.prelaunchTeaser !== undefined) data.prelaunchTeaser = dto.prelaunchTeaser;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.keywords !== undefined) data.keywords = dto.keywords as any;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.subcategoryId !== undefined) data.subcategoryId = dto.subcategoryId;
    if (dto.brandId !== undefined) data.brandId = dto.brandId;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl; 

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

    if (dto.specifications !== undefined) {
      const specEntries = this.dedupeSpecifications(dto.specifications);
      if (specEntries.length > 0) {
        data.specifications = {
          create: specEntries.map(([key, value]) => ({ key, value })),
        };
      }
    }

    if (dto.certifications?.length) {
      data.certifications = {
        create: dto.certifications.map((name) => ({ name })),
      };
    }

    // `set` fully replaces the m2m selection with whatever the form last
    // submitted (including clearing it out if the admin removed everything).
    if (applicationRefs !== undefined) {
      data.applications = { set: applicationRefs };
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data,
        include: this.productInclude,
      });
    } catch (err) {
      throw this.toFriendlyPrismaError(err, dto.sku);
    }
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

    // categoryId isn't in the payload at all when the import row's Category
    // name didn't match anything — fall back to a shared "Uncategorized"
    // bucket rather than rejecting the row, since only Name should be
    // strictly required for a bulk import.
    let fallbackCategoryId: string | null = null;
    const getFallbackCategoryId = async () => {
      if (fallbackCategoryId) return fallbackCategoryId;
      const fallback = await this.prisma.category.upsert({
        where: { slug: 'uncategorized' },
        update: {},
        create: { name: 'Uncategorized', slug: 'uncategorized' },
      });
      fallbackCategoryId = fallback.id;
      return fallbackCategoryId;
    };

    for (let i = 0; i < products.length; i++) {
      try {
        const row = { ...products[i] };
        if (!row.categoryId) row.categoryId = await getFallbackCategoryId();
        await this.create(row);
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
        subcategory: { select: { name: true } },
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: true,
        certifications: true,
        applications: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Column names below match TEMPLATE_COLUMNS in
    // components/admin/products/ProductImportExport.jsx exactly (for the
    // 16 importable fields) so an export can be re-uploaded through
    // "Upload Filled Template" with zero manual edits — this is what
    // makes a localhost -> hosted migration actually work. ID/Created At
    // are extra reference columns the importer ignores.
    return products.map((p) => ({
      Name: p.name,
      SKU: p.sku,
      Model: p.model || '',
      Category: p.category?.name || '',
      Subcategory: p.subcategory?.name || '',
      Brand: p.brand?.name || '',
      Description: p.description || '',
      'Key Features': p.keyFeatures || '',
      Material: p.material || '',
      Manufacturer: p.manufacturer || '',
      Applications: p.applications?.map((a) => a.name).join('; ') || '',
      'Video URL': p.videoUrl || '',
      'Meta Title': p.metaTitle || '',
      'Meta Description': p.metaDescription || '',
      'Is Active': p.isActive ? 'Yes' : 'No',
      'Is Featured': p.isFeatured ? 'Yes' : 'No',
      // Reference-only columns below (imported back in if you fill/edit
      // Specifications, Certifications, or Image URLs — see mapping in
      // ProductImportExport.jsx's confirmImport).
      Specifications: p.specifications?.map((s) => `${s.key}: ${s.value}`).join('; ') || '',
      Certifications: p.certifications?.map((c) => c.name).join('; ') || '',
      'Image URLs': p.images?.map((i) => i.url).join('; ') || '',
      ID: p.id,
      'Created At': p.createdAt.toISOString(),
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
  // IMAGE UPLOAD (Cloudinary – unchanged)
  // ============================================

  async uploadImage(file: Express.Multer.File, productId?: string) {
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

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

  // ============================================
  // BROCHURE – LOCAL STORAGE & COMPRESSION
  // ============================================

  /**
   * Compress the uploaded file:
   * - PDF → pdf‑lib (optimises)
   * - Image → sharp (WebP, quality 80)
   * Returns the final file path (the same as the original after replacement).
   */
  async compressBrochure(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const inputPath = file.path;
    const outputPath = inputPath + '.compressed' + ext;
    const inputBuffer = fs.readFileSync(inputPath);

    if (ext === '.pdf') {
      const pdfDoc = await PDFDocument.load(inputBuffer);
      const compressedBytes = await pdfDoc.save({ useObjectStreams: false });
      fs.writeFileSync(outputPath, compressedBytes);
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
    } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const output = await sharp(inputPath).webp({ quality: 80 }).toBuffer();
      fs.writeFileSync(outputPath, output);
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
    }
    return inputPath;
  }

  /**
   * Update product with brochure metadata (local path).
   */
  async updateBrochure(productId: string, data: {
    url: string;
    name: string;
    size: number;
    format: string;
  }) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        brochureUrl: data.url,             // relative path, e.g. "products/brochure/..."
        brochureName: data.name,
        brochureSize: data.size,
        brochureFormat: data.format,
        brochurePublicId: null,
        brochureResourceType: null,
      },
    });
  }

  /**
   * Delete brochure – remove file from disk and clear DB fields.
   */
  async deleteBrochure(productId: string) {
    const product = await this.findOne(productId);
    if (product.brochureUrl) {
      const filePath = path.join(process.cwd(), 'public', product.brochureUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        brochureUrl: null,
        brochureName: null,
        brochureSize: null,
        brochureFormat: null,
        brochurePublicId: null,
        brochureResourceType: null,
      },
    });
  }

  /**
   * Read the product's already-uploaded brochure off disk and ask Gemini to
   * extract structured product data from it (name, model, description,
   * key features, specifications). Purely a suggestion — nothing is saved
   * here; the admin reviews and applies fields on the frontend.
   */
  async extractBrochureMetadata(productId: string) {
    const product = await this.findOne(productId);
    if (!product.brochureUrl) {
      throw new BadRequestException('Upload a brochure first, then auto-fill from it.');
    }
    const format = product.brochureFormat || path.extname(product.brochureUrl).slice(1);
    if (!this.gemini.isSupportedFormat(format)) {
      throw new BadRequestException(
        'Auto-fill only works on PDF or image brochures (JPG/PNG/WebP). This brochure is a different format — please fill the details in manually.',
      );
    }
    const filePath = path.join(process.cwd(), 'public', product.brochureUrl);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Brochure file could not be found on the server.');
    }
    const fileBuffer = fs.readFileSync(filePath);
    return this.gemini.extractProductDataFromFile(fileBuffer, format);
  }

  // ============================================
  // PRE-LAUNCH / TEASER — "Notify Me" signups
  // ============================================

  async notifyMe(productId: string, email: string) {
    const product = await this.findOne(productId);
    if (!product.isPrelaunch) {
      throw new BadRequestException('This product is already available — no need to be notified.');
    }
    try {
      await this.prisma.productLaunchNotify.create({ data: { productId, email } });
    } catch (err: any) {
      // Unique constraint — they already signed up. Treat as success (idempotent).
      if (err?.code !== 'P2002') throw err;
    }
    const count = await this.prisma.productLaunchNotify.count({ where: { productId } });
    return { success: true, notifyCount: count };
  }

  async getNotifyList(productId: string) {
    await this.findOne(productId);
    const [count, entries] = await Promise.all([
      this.prisma.productLaunchNotify.count({ where: { productId } }),
      this.prisma.productLaunchNotify.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);
    return { count, entries };
  }

  // ============================================
  // PRODUCT VARIANTS (color/size/material/etc — optional, flexible attributes)
  // ============================================

  private readonly variantInclude = {
    brand: { select: { id: true, name: true, logo: true, slug: true } },
    applications: { select: { id: true, name: true, isActive: true } },
  };

  async getVariants(productId: string) {
    await this.findOne(productId); // 404s if the product doesn't exist
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
      include: this.variantInclude,
    });
  }

  private variantWriteData(data: Partial<VariantWriteInput>) {
    const { applicationIds, ...scalarFields } = data;
    return { scalarFields, applicationIds };
  }

  async createVariant(productId: string, data: VariantWriteInput & { name: string; attributes: Record<string, string> }) {
    await this.findOne(productId);
    const { scalarFields, applicationIds } = this.variantWriteData(data);
    return this.prisma.productVariant.create({
      data: {
        productId,
        ...scalarFields,
        name: data.name,
        attributes: data.attributes || {},
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        ...(applicationIds ? { applications: { connect: applicationIds.map((id) => ({ id })) } } : {}),
      },
      include: this.variantInclude,
    });
  }

  async updateVariant(productId: string, variantId: string, data: Partial<VariantWriteInput>) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException('Variant not found for this product');
    }
    const { scalarFields, applicationIds } = this.variantWriteData(data);
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...scalarFields,
        ...(applicationIds !== undefined ? { applications: { set: applicationIds.map((id) => ({ id })) } } : {}),
      },
      include: this.variantInclude,
    });
  }

  async deleteVariant(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException('Variant not found for this product');
    }
    await this.prisma.productVariant.delete({ where: { id: variantId } });
    return { success: true };
  }

  private async getVariantOrThrow(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException('Variant not found for this product');
    }
    return variant;
  }

  async uploadVariantBrochure(productId: string, variantId: string, file: Express.Multer.File) {
    const variant = await this.getVariantOrThrow(productId, variantId);
    if (variant.brochurePublicId) {
      await this.cloudinary.deleteBrochure(variant.brochurePublicId, variant.brochureResourceType || 'raw');
    }
    const uploaded = await this.cloudinary.uploadBrochure(file, `${productId}/variants/${variantId}`);
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        brochureUrl: uploaded.url,
        brochureName: uploaded.name,
        brochureSize: uploaded.size,
        brochureFormat: uploaded.format,
        brochurePublicId: uploaded.publicId,
        brochureResourceType: uploaded.resourceType,
      },
      include: this.variantInclude,
    });
  }

  async deleteVariantBrochure(productId: string, variantId: string) {
    const variant = await this.getVariantOrThrow(productId, variantId);
    if (variant.brochurePublicId) {
      await this.cloudinary.deleteBrochure(variant.brochurePublicId, variant.brochureResourceType || 'raw');
    }
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        brochureUrl: null, brochureName: null, brochureSize: null,
        brochureFormat: null, brochurePublicId: null, brochureResourceType: null,
      },
      include: this.variantInclude,
    });
  }

  async uploadVariantDesignFile(productId: string, variantId: string, file: Express.Multer.File) {
    const variant = await this.getVariantOrThrow(productId, variantId);
    if (variant.designFilePublicId) {
      await this.cloudinary.deleteDesignFile(variant.designFilePublicId, variant.designFileResourceType || 'raw');
    }
    const uploaded = await this.cloudinary.uploadDesignFile(file, `${productId}/variants/${variantId}`);
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        designFileUrl: uploaded.url,
        designFileName: uploaded.name,
        designFileSize: uploaded.size,
        designFileFormat: uploaded.format,
        designFilePublicId: uploaded.publicId,
        designFileResourceType: uploaded.resourceType,
      },
      include: this.variantInclude,
    });
  }

  async deleteVariantDesignFile(productId: string, variantId: string) {
    const variant = await this.getVariantOrThrow(productId, variantId);
    if (variant.designFilePublicId) {
      await this.cloudinary.deleteDesignFile(variant.designFilePublicId, variant.designFileResourceType || 'raw');
    }
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        designFileUrl: null, designFileName: null, designFileSize: null,
        designFileFormat: null, designFilePublicId: null, designFileResourceType: null,
      },
      include: this.variantInclude,
    });
  }

  // ============================================
  // PRODUCT DESIGN FILE – CLOUDINARY (CAD/artwork)
  // ============================================

  async uploadDesignFile(productId: string, file: Express.Multer.File) {
    const product = await this.findOne(productId);
    // Replacing an existing design file: clean up the old Cloudinary asset first.
    if (product.designFilePublicId) {
      await this.cloudinary.deleteDesignFile(
        product.designFilePublicId,
        product.designFileResourceType || 'raw',
      );
    }
    const uploaded = await this.cloudinary.uploadDesignFile(file, productId);
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        designFileUrl: uploaded.url,
        designFileName: uploaded.name,
        designFileSize: uploaded.size,
        designFileFormat: uploaded.format,
        designFilePublicId: uploaded.publicId,
        designFileResourceType: uploaded.resourceType,
      },
    });
  }

  async deleteDesignFile(productId: string) {
    const product = await this.findOne(productId);
    if (product.designFilePublicId) {
      await this.cloudinary.deleteDesignFile(
        product.designFilePublicId,
        product.designFileResourceType || 'raw',
      );
    }
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        designFileUrl: null,
        designFileName: null,
        designFileSize: null,
        designFileFormat: null,
        designFilePublicId: null,
        designFileResourceType: null,
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