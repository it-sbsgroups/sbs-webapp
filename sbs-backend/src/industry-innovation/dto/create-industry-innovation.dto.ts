import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIndustryInnovationDto {
  @ApiProperty({ description: 'Main section title', example: 'Driving Innovation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'URL to the section image/background' })
  @IsString()
  @IsNotEmpty()
  image: string;
}