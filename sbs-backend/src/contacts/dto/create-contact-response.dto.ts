import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactResponseDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  emailBody: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  subject?: string;

  @ApiProperty({ example: 'support@company.com' })
  @IsString() @IsNotEmpty()
  sentFrom: string;

  @ApiPropertyOptional()
  @IsOptional()
  sentAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  receivedAt?: string;
}