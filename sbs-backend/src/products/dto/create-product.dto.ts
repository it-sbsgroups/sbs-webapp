import { Type } from 'class-transformer';
import {
  IsString, IsOptional, IsBoolean, IsArray, IsObject,
  ValidateNested, IsNumber, Min, Max,
} from 'class-validator';

export class CreateImageDto {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  angle?: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateProductDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  keyFeatures?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  // Foreign keys
  @IsString()
  categoryId: string;

  @IsString()
  @IsOptional()
  subcategoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  // Relations
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  @IsOptional()
  images?: CreateImageDto[];

  @IsObject()
  @IsOptional()
  specifications?: Record<string, string>;

  @IsArray()
  @IsOptional()
  certifications?: string[];
}