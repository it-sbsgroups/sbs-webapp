// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
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
import { SystemLogsModule } from './system-logs/system-logs.module';
import { AdminOtpModule } from './admin-otp/admin-otp.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ActivityLoggingInterceptor } from './common/activity-logging.interceptor';
import { CertificatesModule } from './certificates/certificates.module';
import { ApplicationsModule } from './applications/applications.module';
import { GeminiModule } from './gemini/gemini.module';
import { DashboardModule } from './dashboard/dashboard.module';

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
    SystemLogsModule,
    AdminOtpModule,
    CertificatesModule,
    ApplicationsModule,
    GeminiModule,
    DashboardModule,
  ],
  controllers: [AppController, MailController, SubscribersController],
  providers: [
    AppService,
    PrismaService,
    MailService,
    EmailTemplatesService,
    // System logs generation: previously nothing in the app ever called
    // SystemLogsService.log(), so Admin -> System Logs stayed empty. These
    // two global providers are the fix — the filter captures every error,
    // the interceptor captures every successful save/upload/delete.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ActivityLoggingInterceptor },
  ],
})
export class AppModule {}