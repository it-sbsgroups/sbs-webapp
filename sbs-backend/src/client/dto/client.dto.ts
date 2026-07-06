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
  companyName!: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsArray()
  gallery?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
