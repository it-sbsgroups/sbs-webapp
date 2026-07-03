import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClientDto {
  @IsOptional()
  @IsString()
  slug?: string; // auto-generated from companyName when omitted

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  servingSince?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsObject()
  contact?: Record<string, any>; // { phone, email }

  @IsOptional()
  @IsObject()
  social?: Record<string, any>; // { linkedin, instagram, twitter }

  @IsOptional()
  @IsArray()
  gallery?: string[];

  @IsOptional()
  @IsArray()
  reviews?: { date?: string; rating?: number; description?: string }[];

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
