import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GeminiModule } from '../gemini/gemini.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CataloguePdfService } from './catalogue-pdf.service';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    CloudinaryModule,
    GeminiModule,
    NotificationsModule,
    ApplicationsModule,
    MulterModule.register({
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB raw upload (compressed server-side)
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CataloguePdfService],
  exports: [ProductsService],
})
export class ProductsModule {}