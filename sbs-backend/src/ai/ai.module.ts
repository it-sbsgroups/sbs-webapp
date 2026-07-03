// FILE: src/ai/ai.module.ts  (FULL REPLACEMENT)
// Only change from previous version: imports ApiKeysModule instead of
// relying on the globally provided ConfigService for the Gemini key.
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { ProductsModule } from '../products/products.module';
import { NewsModule } from '../news/news.module';
import { RfqModule } from '../rfq/rfq.module';
import { BrandsModule } from '../brands/brands.module';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    ApiKeysModule,      // ← provides ApiKeysService (3-tier key resolution)
    ProductsModule,
    NewsModule,
    RfqModule,
    BrandsModule,
    SubscribersModule,
    CategoriesModule,
  ],
  controllers: [AiController],
})
export class AiModule {}
