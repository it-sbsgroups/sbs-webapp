import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateReplyDto {
  @ApiPropertyOptional({ description: 'Email subject (overrides default)' })
  @IsOptional() @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Email body (plain text or HTML) – overrides default template' })
  @IsOptional() @IsString()
  emailBody?: string;
}