// src/industry-innovation/entities/industry-innovation.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class IndustryInnovationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // optionally include keys
  keys?: IndustryInnovationKeyEntity[];
}

export class IndustryInnovationKeyEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  innovationId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}