import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClientDto {
  @IsOptional()
  @IsString()
  slug?: string; // auto-generated from companyName when omitted

  @IsString()
  @MinLength(2)
  contactName!: string; // person to contact at the client's company

  @IsString()
  @MinLength(2)
  companyName!: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  phone!: string;

  @IsOptional()
  @IsString()
  logo?: string; // Cloudinary URL

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  gallery?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
