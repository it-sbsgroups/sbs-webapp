import { PartialType } from '@nestjs/swagger';
import { CreateContactResponseDto } from './create-contact-response.dto';

export class UpdateContactResponseDto extends PartialType(CreateContactResponseDto) {}