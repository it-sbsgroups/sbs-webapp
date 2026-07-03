import { Module } from '@nestjs/common';
import { ContactResponsesService } from './contact-responses.service';
import { ContactResponsesController } from './contact-responses.controller';

@Module({
  controllers: [ContactResponsesController],
  providers: [ContactResponsesService],
})
export class ContactResponsesModule {}
