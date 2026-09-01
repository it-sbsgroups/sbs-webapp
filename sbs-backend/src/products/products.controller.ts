// sbs-backend/src/products/products.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, Res, UseInterceptors, UploadedFile,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer'; // <-- import multer as default
import { extname, join, basename } from 'path'; // <-- import basename
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { CataloguePdfService } from './catalogue-pdf.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cataloguePdfService: CataloguePdfService,
  ) {}

  // ---- Catalogue PDF ----
  @Public()
  @Get('catalogue/download')
  async downloadCatalogue(@Res() res: Response) {
    await this.cataloguePdfService.streamCatalogue(res);
  }

  // ---- Product list & search ----
  @Public()
  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  // ---- CSV Export ----
  @Get('export/csv')
  async exportCSV(@Res() res: Response) {
    const data = await this.productsService.exportToCSV();
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map((row: any) =>
      Object.values(row).map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = '\uFEFF' + [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=products_export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }

  // ---- Public SKU lookup ----
  @Public()
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  // ---- Single product ----
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ---- Related products ----
  @Public()
  @Get(':id/related')
  async getRelated(
    @Param('id') id: string,
    @Query('mode') mode?: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getRelated(id, mode, limit || 4);
  }

  // ============================================
  // IMAGE UPLOAD (unchanged – Cloudinary)
  // ============================================

  @Post('images/upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async uploadImageStandalone(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image uploaded');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    return this.productsService.uploadImage(file);
  }

  @Post(':id/images/upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async uploadImageForProduct(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No image uploaded');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    return this.productsService.uploadImage(file, id);
  }

  // ============================================
  // BROCHURE – LOCAL STORAGE & COMPRESSION
  // ============================================

  /**
   * Upload a brochure file (PDF, DOC, DOCX, JPG, PNG, WebP, XLS, XLSX)
   * – stored in `public/products/brochure/`
   * – compressed (PDF via pdf‑lib, images via sharp)
   * – database updated with local path
   */
  @Post(':id/brochure')
  @UseInterceptors(
    FileInterceptor('brochure', {
      storage: multer.diskStorage({
        destination: './public/products/brochure',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async uploadBrochure(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const compressedPath = await this.productsService.compressBrochure(file);
    // ✅ store relative path (no leading slash)
    const relativePath = `products/brochure/${basename(compressedPath)}`;
    const product = await this.productsService.updateBrochure(id, {
      url: relativePath,
      name: file.originalname,
      size: file.size,
      format: extname(file.originalname).slice(1),
    });
    return product;
  }

  /**
   * Ask Gemini to suggest product fields from the already-uploaded brochure.
   * Returns suggestions only — the admin reviews and applies them client-side.
   */
  @Post(':id/brochure/extract')
  async extractBrochureMetadata(@Param('id') id: string) {
    return this.productsService.extractBrochureMetadata(id);
  }

  /**
   * Serve a brochure for preview or download.
   * ?mode=preview → inline, ?mode=download (default) → attachment
   */
  @Public()
  @Get(':id/brochure/download')
  async downloadBrochure(
    @Param('id') id: string,
    @Query('mode') mode: string = 'download',
    @Res() res: Response
  ) {
    const product = await this.productsService.findOne(id);
    if (!product?.brochureUrl) {
      throw new NotFoundException('No brochure available');
    }
    const url = product.brochureUrl;
    if (mode === 'preview') {
      return res.redirect(url);
    } else {
      // Force download via Cloudinary's fl_attachment flag
      return res.redirect(url + '?fl_attachment=true');
    }
  }

  /**
   * Delete brochure – removes file from disk and clears DB fields.
   */
  @Delete(':id/brochure')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBrochure(@Param('id') id: string) {
    await this.productsService.deleteBrochure(id);
  }

  // ============================================
  // PRE-LAUNCH / TEASER — "Notify Me"
  // ============================================

  @Public()
  @Post(':id/notify-me')
  async notifyMe(@Param('id') id: string, @Body('email') email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email is required');
    }
    return this.productsService.notifyMe(id, email);
  }

  @Get(':id/notify-list')
  async getNotifyList(@Param('id') id: string) {
    return this.productsService.getNotifyList(id);
  }

  // ============================================
  // VARIANTS (color/size/material/etc — optional)
  // ============================================

  @Get(':id/variants')
  async getVariants(@Param('id') id: string) {
    return this.productsService.getVariants(id);
  }

  @Post(':id/variants')
  async createVariant(@Param('id') id: string, @Body() body: any) {
    return this.productsService.createVariant(id, body);
  }

  @Put(':id/variants/:variantId')
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: any,
  ) {
    return this.productsService.updateVariant(id, variantId, body);
  }

  @Delete(':id/variants/:variantId')
  async deleteVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.deleteVariant(id, variantId);
  }

  @Post(':id/variants/:variantId/brochure')
  @UseInterceptors(
    FileInterceptor('brochure', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = new Set([
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
        if (!allowed.has(file.mimetype)) return cb(new BadRequestException('Unsupported brochure type'), false);
        cb(null, true);
      },
    }),
  )
  async uploadVariantBrochure(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.productsService.uploadVariantBrochure(id, variantId, file);
  }

  @Delete(':id/variants/:variantId/brochure')
  async deleteVariantBrochure(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.deleteVariantBrochure(id, variantId);
  }

  @Post(':id/variants/:variantId/design')
  @UseInterceptors(
    FileInterceptor('design', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowedExt = ['.pdf', '.dwg', '.dxf', '.ai', '.psd', '.eps', '.svg', '.jpg', '.jpeg', '.png', '.webp'];
        if (!allowedExt.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Unsupported file type. Allowed: PDF, DWG, DXF, AI, PSD, EPS, SVG, JPG, PNG, WebP.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadVariantDesignFile(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.productsService.uploadVariantDesignFile(id, variantId, file);
  }

  @Delete(':id/variants/:variantId/design')
  async deleteVariantDesignFile(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.productsService.deleteVariantDesignFile(id, variantId);
  }

  // ============================================
  // DESIGN FILE – CLOUDINARY (CAD/artwork: pdf, dwg, dxf, ai, psd, eps, svg, jpg, png, webp)
  // ============================================

  @Post(':id/design')
  @UseInterceptors(
    FileInterceptor('design', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        const allowedExt = ['.pdf', '.dwg', '.dxf', '.ai', '.psd', '.eps', '.svg', '.jpg', '.jpeg', '.png', '.webp'];
        // CAD/illustration tools report inconsistent (often generic) mimetypes,
        // so this validates by extension rather than file.type.
        if (!allowedExt.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Unsupported file type. Allowed: PDF, DWG, DXF, AI, PSD, EPS, SVG, JPG, PNG, WebP.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDesignFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.productsService.uploadDesignFile(id, file);
  }

  @Public()
  @Get(':id/design/download')
  async downloadDesignFile(
    @Param('id') id: string,
    @Query('mode') mode: string = 'download',
    @Res() res: Response,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product?.designFileUrl) {
      throw new NotFoundException('No design file available');
    }
    const url = product.designFileUrl;
    if (mode === 'preview') {
      return res.redirect(url);
    }
    return res.redirect(url + '?fl_attachment=true');
  }

  @Delete(':id/design')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDesignFile(@Param('id') id: string) {
    await this.productsService.deleteDesignFile(id);
  }

  // ---- Helper for MIME type (optional) ----
  private getMimeType(fileName: string): string {
    const ext = extname(fileName).toLowerCase();
    const map: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    return map[ext] || 'application/octet-stream';
  }

  // ============================================
  // CRUD (unchanged)
  // ============================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post('bulk-import')
  @HttpCode(HttpStatus.OK)
  async bulkImport(@Body() body: { products: CreateProductDto[] }) {
    return this.productsService.bulkImport(body.products);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }

  @Put(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }

  @Put(':id/restore')
  async restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Put(':id/toggle-featured')
  async toggleFeatured(@Param('id') id: string) {
    return this.productsService.toggleFeatured(id);
  }
}