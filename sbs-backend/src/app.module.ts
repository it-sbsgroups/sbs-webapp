// FILE: src/app.module.ts  (FULL REPLACEMENT)
// Changes from original:
//   + ApiKeysModule  — 3-tier credential fallback (DB → .env → hardcode)
//   + AiModule       — Gemini chat with real DB tool-calling
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { RfqModule } from './rfq/rfq.module';
import { SettingsModule } from './settings/settings.module';
import { NewsModule } from './news/news.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailService } from './mail/mail.service';
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';
import { EmployeeModule } from './employee/employee.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { CarouselModule } from './carousel/carousel.module';
import { ClientsModule } from './client/clients.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { UploadsModule } from './uploads/uploads.module';
import { FaqModule } from './faq/faq.module';
import { AiModule } from './ai/ai.module';                  // ← NEW
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContactResponsesModule } from './contacts/contact-responses.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ApiKeysModule,      // ← NEW: register before any module that uses it
    AuthModule,         // JwtAuthGuard now uses ApiKeysService
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    RfqModule,
    SettingsModule,
    NewsModule,
    CloudinaryModule,   // CloudinaryService now uses ApiKeysService
    MailModule,
    EmployeeModule,
    SubscribersModule,
    CarouselModule,
    ClientsModule,
    TestimonialsModule,
    NotificationsModule,
    SiteConfigModule,   // now includes /site-config/:section with cache invalidation
    UploadsModule,
    FaqModule,
    AiModule,
    ContactsModule,
    ContactResponsesModule,           // ← NEW: Gemini chat with DB tool-calling
  ],
  controllers: [AppController, MailController],
  providers: [AppService, PrismaService, MailService],
})
export class AppModule {}
