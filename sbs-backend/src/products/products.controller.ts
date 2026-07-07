import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, Res, UseInterceptors, UploadedFile, BadRequestException, NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
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

  // Full catalogue as a real, downloadable PDF — category/subcategory-wise,
  // one image + name + model + certifications + key features per product.
  @Public()
  @Get('catalogue/download')
  async downloadCatalogue(@Res() res: Response) {
    await this.cataloguePdfService.streamCatalogue(res);
  }

  @Public()
  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

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

  @Public()
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

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
  // IMAGE UPLOAD ENDPOINTS (server-side WebP + compression to <100KB)
  // ============================================

  // Standalone upload — used while CREATING a product (no id yet).
  @Post('images/upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB raw input allowed
    }),
  )
  async uploadImageStandalone(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image uploaded');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    return this.productsService.uploadImage(file);
  }

  // Upload tied to an existing product (used while EDITING).
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
  // BROCHURE ENDPOINTS
  // ============================================

  @Post(':id/brochure')
  @UseInterceptors(
    FileInterceptor('brochure', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async uploadBrochure(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.productsService.uploadBrochure(id, file);
  }

  @Delete(':id/brochure')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBrochure(@Param('id') id: string) {
    await this.productsService.deleteBrochure(id);
  }

  @Public()
  @Get(':id/brochure/download')
  async downloadBrochure(
    @Param('id') id: string,
    @Query('mode') mode: string,
    @Res() res: Response,
  ) {
    const product = await this.productsService.findOne(id);

    if (!product.brochureUrl) {
      throw new NotFoundException('No brochure available for this product');
    }

    // If mode is 'preview', modify URL to show inline instead of download
    const url = mode === 'preview'
      ? product.brochureUrl.replace('/upload/', '/upload/fl_attachment:false/')
      : product.brochureUrl.replace('/upload/', '/upload/fl_attachment/');

    res.redirect(url);
  }

  // ============================================
  // CRUD ENDPOINTS
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