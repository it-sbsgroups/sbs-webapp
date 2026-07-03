import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  responded?: boolean;

  @ApiPropertyOptional({ description: 'Internal admin note' })
  @IsOptional() @IsString()
  adminNote?: string;
}