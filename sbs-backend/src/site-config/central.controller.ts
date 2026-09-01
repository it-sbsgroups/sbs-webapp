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
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SiteConfigService } from './site-config.service';
import { Public } from '../auth/decorators/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';
import * as multer from 'multer';
import { SiteConfigOtpGuard } from '../admin-otp/site-config-otp.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// NOTE: this is the ONLY controller allowed to own the `/site` prefix.
// A second controller (`SiteConfigController`, formerly @Controller('site'))
// was removed on 2026-07-26 because it duplicated this prefix with literal
// routes (branding/contact/about/founders/homeAbout/homePrinciples) that
// silently shadowed the routes below — see the module's history/comments in
// site-config.module.ts before recreating anything like it. If a section
// needs a dedicated route (like apiKeys below), add it to THIS file, above
// the `:key` wildcard, not in a separate controller.
const VALID_KEYS = new Set([
  'branding', 'header', 'contact', 'about', 'apiKeys', 'founders', 'font',
  'company', 'footer', 'homeAbout', 'homePrinciples', 'AuthorizedNetwork', 
  'IndustriesManager', 'ProtectionProven', 'WhyContact', 'PartnershipAdvantages', 
  'PartnershipWork', 'whyChooseUs', 'rfqEmailRecipients', 'breadcrumbBanners',
  'distributor', 'sectionDesign', 'ownBrandsCardDesign', 'chatbotFlow',
]);
 
@Controller('site')
export class CentralSiteController {
  constructor(
    private readonly siteConfig: SiteConfigService,
    private readonly cloudinarySvc: CloudinaryService,
  ) {}

  // ── apiKeys: deliberately registered ABOVE the `:key` wildcard ──────────
  // apiKeys holds Cloudinary/JWT/ERP/WhatsApp secrets. It must never be
  // reachable through the public wildcard below. Because Nest/Express match
  // routes in declaration order, this literal route wins for `/site/apiKeys`
  // and the wildcard never sees it.
  @Get('apiKeys')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  getApiKeys() {
    return this.siteConfig.get('apiKeys');
  }

  @Put('apiKeys')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateApiKeys(@Body() body: Record<string, any>) {
    return this.siteConfig.set('apiKeys', body);
  }

  // ── Core identity sections: writable only by senior designations ────────
  // Reads are intentionally NOT duplicated here — they stay on the public
  // `:key` wildcard below so About/Contact/Branding/Founders keep rendering
  // for logged-out visitors. Only PUT is elevated.
  @Put('branding')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateBranding(@Body() body: Record<string, any>) {
    return this.siteConfig.set('branding', body);
  }

  @Put('contact')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateContact(@Body() body: Record<string, any>) {
    return this.siteConfig.set('contact', body);
  }

  @Put('about')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateAbout(@Body() body: Record<string, any>) {
    return this.siteConfig.set('about', body);
  }

  @Put('founders')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateFounders(@Body() body: Record<string, any>) {
    return this.siteConfig.set('founders', body);
  }

  @Put('homeAbout')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateHomeAbout(@Body() body: Record<string, any>) {
    return this.siteConfig.set('homeAbout', body);
  }

  @Put('homePrinciples')
  @UseGuards(SiteConfigOtpGuard)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER')
  updateHomePrinciples(@Body() body: Record<string, any>) {
    return this.siteConfig.set('homePrinciples', body);
  }

  @Public()
  @Get(':key')
  get(@Param('key') key: string) {
    if (!VALID_KEYS.has(key)) throw new BadRequestException(`Unknown config key: ${key}`);
    return this.siteConfig.get(key);
  }

  @Public()
  @Get()
  async getAll() {
    // apiKeys is excluded here on purpose — this endpoint is public and feeds
    // the homepage/footer/header in one round trip. Secrets are only ever
    // served by the dedicated, authenticated GET /site/apiKeys above.
    const keys = [...VALID_KEYS].filter((k) => k !== 'apiKeys');
    const results = await Promise.all(keys.map((k) => this.siteConfig.get(k)));
    return Object.fromEntries(keys.map((k, i) => [k, results[i]]));
  }
 
  @Put(':key')
  @UseGuards(SiteConfigOtpGuard)
  update(@Param('key') key: string, @Body() body: Record<string, any>) {
    if (!VALID_KEYS.has(key)) throw new BadRequestException(`Unknown config key: ${key}`);
    if (key === 'apiKeys') {
      // Belt-and-braces: even if route order ever changes, never let the
      // generic wildcard write secrets without the stricter role check.
      throw new BadRequestException('Use PUT /site/apiKeys to update API keys.');
    }
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