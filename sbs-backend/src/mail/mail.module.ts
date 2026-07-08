// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailTemplatesService } from './email-templates.service';

@Module({
  imports: [PrismaModule],
  controllers: [MailController],
  providers: [MailService, EmailTemplatesService],
  exports: [MailService, EmailTemplatesService],
})
export class MailModule {}