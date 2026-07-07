import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CataloguePdfService } from './catalogue-pdf.service';

@Module({
  imports: [
    CloudinaryModule,
    NotificationsModule,
    MulterModule.register({
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB raw upload (compressed server-side)
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CataloguePdfService],
  exports: [ProductsService],
})
export class ProductsModule {}