import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import sharp from 'sharp';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly apiKeys: ApiKeysService) {}

  private async configureCloudinary(): Promise<void> {
    const [cloudName, apiKey, apiSecret] = await Promise.all([
      this.apiKeys.get('CLOUDINARY_CLOUD_NAME'),
      this.apiKeys.get('CLOUDINARY_API_KEY'),
      this.apiKeys.get('CLOUDINARY_API_SECRET'),
    ]);

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Cloudinary credentials incomplete — upload may fail. ' +
          'Set them in Admin → Site Settings → API Keys, or in .env.',
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  }

  async uploadBrochure(
    file: Express.Multer.File,
    productId: string,
  ): Promise<{ url: string; name: string; size: number; format: string }> {
    await this.configureCloudinary();

    const isPdf = file.mimetype === 'application/pdf';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `sbs-products/brochures/${productId}`,
          resource_type: isPdf ? 'raw' : 'auto',
          ...(isPdf ? {} : { quality: 'auto', fetch_format: 'auto' }),
        },
        (error, result) => {
          if (error) { this.logger.error('Brochure upload error:', error); return reject(error); }
          if (!result) return reject(new Error('Upload failed — no result'));
          resolve({
            url: result.secure_url,
            name: file.originalname,
            size: result.bytes,
            format: result.format || (isPdf ? 'pdf' : result.resource_type),
          });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadProductImage(
    file: Express.Multer.File,
    productId = 'unassigned',
    maxBytes = 100 * 1024,
  ): Promise<{ url: string; bytes: number; format: string; width: number; height: number }> {
    await this.configureCloudinary();

    const base = sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });

    let quality = 82;
    let output: Buffer = await base.clone().webp({ quality }).toBuffer();

    while (output.length > maxBytes && quality > 30) {
      quality -= 10;
      output = await base.clone().webp({ quality }).toBuffer();
    }

    if (output.length > maxBytes) {
      output = await sharp(file.buffer, { failOn: 'none' })
        .rotate()
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 60 })
        .toBuffer();
    }

    const meta = await sharp(output).metadata();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `sbs-products/images/${productId}`, resource_type: 'image', format: 'webp' },
        (error, result) => {
          if (error) { this.logger.error('Product image upload error:', error); return reject(error); }
          if (!result) return reject(new Error('Image upload failed — no result'));
          resolve({
            url: result.secure_url,
            bytes: result.bytes,
            format: result.format,
            width: meta.width || 0,
            height: meta.height || 0,
          });
        },
      );
      streamifier.createReadStream(output).pipe(uploadStream);
    });
  }

  async uploadEmployeeImage(
    file: Express.Multer.File,
    employeeId = 'unassigned',
    maxBytes = 200 * 1024,
  ): Promise<{ url: string; bytes: number }> {
    await this.configureCloudinary();

    const base = sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true });

    let quality = 82;
    let output: Buffer = await base.clone().webp({ quality }).toBuffer();

    while (output.length > maxBytes && quality > 30) {
      quality -= 10;
      output = await base.clone().webp({ quality }).toBuffer();
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `sbs-employees/photos/${employeeId}`,
          resource_type: 'image',
          format: 'webp',
          overwrite: true,
        },
        (error, result) => {
          if (error) { this.logger.error('Employee image upload error:', error); return reject(error); }
          if (!result) return reject(new Error('Employee image upload failed'));
          resolve({ url: result.secure_url, bytes: result.bytes });
        },
      );
      streamifier.createReadStream(output).pipe(uploadStream);
    });
  }

  async uploadGenericImage(
    file: Express.Multer.File,
    folder = 'misc',
    maxBytes = 250 * 1024,
  ): Promise<{ url: string; bytes: number; width: number; height: number }> {
    await this.configureCloudinary();

    const base = sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });

    let quality = 82;
    let output: Buffer = await base.clone().webp({ quality }).toBuffer();

    while (output.length > maxBytes && quality > 40) {
      quality -= 10;
      output = await base.clone().webp({ quality }).toBuffer();
    }

    const meta = await sharp(output).metadata();
    const safeFolder = String(folder).replace(/[^a-z0-9/_-]/gi, '').slice(0, 60) || 'misc';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `sbs-media/${safeFolder}`, resource_type: 'image', format: 'webp' },
        (error, result) => {
          if (error) { this.logger.error('Generic image upload error:', error); return reject(error); }
          if (!result) return reject(new Error('Image upload failed'));
          resolve({
            url: result.secure_url,
            bytes: result.bytes,
            width: meta.width || 0,
            height: meta.height || 0,
          });
        },
      );
      streamifier.createReadStream(output).pipe(uploadStream);
    });
  }

  async deleteImageByUrl(url: string): Promise<void> {
    await this.configureCloudinary();
    const publicId = this.getPublicIdFromUrl(url);
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      this.logger.error('Image delete error:', error);
    }
  }

  async deleteBrochure(publicId: string): Promise<void> {
    await this.configureCloudinary();
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      if (result.result === 'not found') {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    } catch (error) {
      this.logger.error('Brochure delete error:', error);
    }
  }

  getPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;
      const afterUpload = parts.slice(uploadIndex + 1);
      const start = /^v\d+$/.test(afterUpload[0]) ? 1 : 0;
      return afterUpload.slice(start).join('/').replace(/\.[^.]+$/, '');
    } catch {
      return null;
    }
  }
}
