import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinarySvc: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Unsupported image type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.cloudinarySvc.uploadGenericImage(file, folder || 'misc');
  }

  @Post('raw')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are accepted'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadRaw(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const safeFolder = (folder || 'misc').replace(/[^a-z0-9/_-]/gi, '').slice(0, 60);

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `sbs-media/${safeFolder}`,
          resource_type: 'image',
        },
        (err, res) => {
          if (err) return reject(err);
          if (!res) return reject(new Error('Upload returned no result'));
          resolve(res);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    return {
      url:    result.secure_url,
      bytes:  result.bytes,
      format: result.format,
      width:  result.width,
      height: result.height,
    };
  }
}