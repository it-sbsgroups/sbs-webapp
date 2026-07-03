import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCarouselSlideDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nextSlideIn?: number;

  @IsOptional()
  @IsString()
  mediaType?: string; // IMAGE | VIDEO | COLOR

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsBoolean()
  videoLoop?: boolean;

  @IsOptional()
  @IsBoolean()
  videoSound?: boolean;

  @IsOptional()
  @IsString()
  solidColor?: string;

  @IsOptional()
  @IsString()
  layoutType?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsString()
  ctaLink?: string;

  @IsOptional()
  @IsBoolean()
  ctaOpenInNewTab?: boolean;

  @IsOptional()
  @IsObject()
  styles?: Record<string, any>;
}

export class UpdateCarouselSlideDto extends PartialType(
  CreateCarouselSlideDto,
) {}

export class ReorderSlidesDto {
  @IsArray()
  @IsObject({ each: true })
  order!: { id: string; order: number }[];
}

export class UpdateCarouselSettingsDto {
  @IsOptional()
  @IsBoolean()
  prevButton?: boolean;

  @IsOptional()
  @IsBoolean()
  nextButton?: boolean;

  @IsOptional()
  @IsBoolean()
  bottomDots?: boolean;

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsString()
  carouselHeight?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  overlayOpacity?: number;
}
