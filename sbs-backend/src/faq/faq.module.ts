import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { FaqService } from './faq.service';
import { FaqPublicController, FaqAdminController } from './faq.controller';

@Module({
  imports: [
    MailModule, // gives us MailService via its exports
  ],
  controllers: [
    FaqPublicController,  // handles GET/POST /faqs/*
    FaqAdminController,   // handles GET/POST/PATCH/DELETE /admin/faqs/*
  ],
  providers: [FaqService],
  exports: [FaqService], // export if other modules (e.g. SiteConfig) need FAQ counts
})
export class FaqModule {}