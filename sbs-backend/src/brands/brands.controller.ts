import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { BrandsService } from './brands.service';
import { Public } from '../auth/decorators/public.decorator';

const BROCHURE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // ---- Public (declared before the generic ':id' route so they aren't shadowed) ----

  @Public()
  @Get('public/list')
  findPublic(@Query('ownBrand') ownBrand?: string) {
    return this.brandsService.findPublic(ownBrand);
  }

  @Public()
  @Get('public/brochures')
  findAllBrochures() {
    return this.brandsService.findAllBrochures();
  }

  @Public()
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: any) {
    return this.brandsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.brandsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }

  // ============================================
  // BROCHURE (admin only — protected by the global JwtAuthGuard)
  // ============================================

  @Post(':id/brochure')
  @UseInterceptors(
    FileInterceptor('brochure', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        if (!BROCHURE_MIME_TYPES.has(file.mimetype)) {
          return cb(new BadRequestException('Unsupported file type. Upload a PDF, DOC, DOCX, XLS, or XLSX.'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadBrochure(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.brandsService.uploadBrochure(id, file);
  }

  @Delete(':id/brochure')
  deleteBrochure(@Param('id') id: string) {
    return this.brandsService.deleteBrochure(id);
  }
}