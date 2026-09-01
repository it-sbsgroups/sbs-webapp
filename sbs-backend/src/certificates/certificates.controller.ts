import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('certificates')
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly cloudinarySvc: CloudinaryService,
  ) {}

  // Public: list all certificates
  @Public()
  @Get()
  findAll() {
    return this.certificatesService.findAll();
  }

  // Admin: create with file upload
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png|gif|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createCertificateDto: CreateCertificateDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const uploaded = await this.cloudinarySvc.uploadGenericImage(file, 'certificates');
    return this.certificatesService.create(createCertificateDto, uploaded.url);
  }

  // Admin: update (file optional)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png|gif|webp)$/i }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      const uploaded = await this.cloudinarySvc.uploadGenericImage(file, 'certificates');
      imageUrl = uploaded.url;
    }
    return this.certificatesService.update(id, updateCertificateDto, imageUrl);
  }

  // Admin: delete
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) {
    return this.certificatesService.delete(id);
  }
}