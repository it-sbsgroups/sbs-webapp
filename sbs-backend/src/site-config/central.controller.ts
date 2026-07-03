import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SiteConfigService } from './site-config.service';
import { Public } from '../auth/decorators/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import * as multer from 'multer';
 
const VALID_KEYS = new Set([
  'branding', 'header', 'contact', 'about', 'apiKeys', 'founders', 'font',
  'company', 'footer',
]);
 
@Controller('site')
export class CentralSiteController {
  constructor(
    private readonly siteConfig: SiteConfigService,
    private readonly cloudinarySvc: CloudinaryService,
  ) {}

  @Public()
  @Get(':key')
  get(@Param('key') key: string) {
    if (!VALID_KEYS.has(key)) throw new BadRequestException(`Unknown config key: ${key}`);
    return this.siteConfig.get(key);
  }

  @Public()
  @Get()
  async getAll() {
    const keys = [...VALID_KEYS];
    const results = await Promise.all(keys.map((k) => this.siteConfig.get(k)));
    return Object.fromEntries(keys.map((k, i) => [k, results[i]]));
  }
 
  @Put(':key')
  update(@Param('key') key: string, @Body() body: Record<string, any>) {
    if (!VALID_KEYS.has(key)) throw new BadRequestException(`Unknown config key: ${key}`);
    return this.siteConfig.set(key, body);
  }

  @Post('upload/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are accepted for the logo.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');
    const result = await this.uploadRawToCloudinary(file, 'sbs-media/branding/logo');
    return { url: result.secure_url, bytes: result.bytes, format: result.format };
  }

  @Post('upload/favicon')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 1 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const isIco =
          file.mimetype === 'image/x-icon' ||
          file.mimetype === 'image/vnd.microsoft.icon' ||
          file.originalname.toLowerCase().endsWith('.ico');
        if (!isIco) {
          return cb(
            new BadRequestException(
              'Favicon must be an .ico file. Please convert your image to .ico format first. ' +
              'Tools: https://favicon.io/favicon-converter or https://convertio.co/png-ico/',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'sbs-media/branding/favicon', resource_type: 'raw', public_id: 'favicon' },
        (err, res) => { if (err) return reject(err); resolve(res); },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
    return { url: result.secure_url, bytes: result.bytes };
  }

  @Post('upload/founder')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are accepted.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFounderImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('person') person: string = 'founder',
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    const folder = `sbs-media/branding/${person === 'cofounder' ? 'cofounder' : 'founder'}`;
    const result = await this.uploadRawToCloudinary(file, folder);
    return { url: result.secure_url, bytes: result.bytes };
  }

  @Post('upload/journey')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are accepted.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadJourneyImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');
    const result = await this.uploadRawToCloudinary(file, 'sbs-media/about/journey');
    return { url: result.secure_url, bytes: result.bytes };
  }
 
  private uploadRawToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (err, result) => {
          if (err) return reject(err);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }
}