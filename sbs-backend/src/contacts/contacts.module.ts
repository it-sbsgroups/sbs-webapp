import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ContactResponsesService } from './contact-responses.service';
import { ContactResponsesController } from './contact-responses.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ContactsController, ContactResponsesController],
  providers: [ContactsService, ContactResponsesService],
  exports: [ContactsService, ContactResponsesService],
})
export class ContactsModule {}