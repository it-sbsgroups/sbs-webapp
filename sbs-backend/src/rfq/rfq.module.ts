import { Module } from '@nestjs/common';
import { RfqService } from './rfq.service';
import { RfqController } from './rfq.controller';
import { RfqIntegrationsService } from './rfq-integrations.service';
import { QuotationPdfService } from './quotation-pdf.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [RfqController],
  providers: [RfqService, RfqIntegrationsService, QuotationPdfService],
  exports: [RfqService, RfqIntegrationsService],
})
export class RfqModule {}