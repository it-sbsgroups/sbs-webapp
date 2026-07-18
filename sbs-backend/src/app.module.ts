// src/app.module.ts
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
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
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContactResponsesModule } from './contacts/contact-responses.module';
import { IndustryInnovationModule } from './industry-innovation/industry-innovation.module';
import { EmailTemplatesService } from './mail/email-templates.service';
import { SubscribersController } from './subscribers/subscribers.controller';
import { WhyChooseUsModule } from './why-choose-us/why-choose-us.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Serves files placed under sbs-backend/public (e.g. public/brands/brochure/*)
    // at the same relative URL — this middleware runs outside the 'api' global
    // prefix, so a file at public/brands/brochure/foo.pdf is reachable at
    // https://<backend-host>/brands/brochure/foo.pdf
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    ApiKeysModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    RfqModule,
    SettingsModule,
    NewsModule,
    CloudinaryModule,
    MailModule,
    EmployeeModule,
    SubscribersModule,
    CarouselModule,
    ClientsModule,
    TestimonialsModule,
    NotificationsModule,
    SiteConfigModule,
    UploadsModule,
    FaqModule,
    ContactsModule,
    ContactResponsesModule,
    IndustryInnovationModule,
    WhyChooseUsModule,
    SearchModule,
  ],
  controllers: [AppController, MailController, SubscribersController],
  providers: [AppService, PrismaService, MailService, EmailTemplatesService],
})
export class AppModule {}