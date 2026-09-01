import { IsString, IsOptional } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}