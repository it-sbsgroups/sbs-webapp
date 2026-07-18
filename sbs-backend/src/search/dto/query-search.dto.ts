import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySearchDto {
  // The raw search text typed by the visitor.
  @IsOptional()
  @IsString()
  q?: string;

  // 'all' = mixed preview across every entity (used by the header dropdown).
  // A specific type = full paginated results for just that entity (used by
  // the dedicated /search results page + its tabs).
  @IsOptional()
  @IsIn(['all', 'products', 'news', 'brands'])
  type?: string = 'all';

  // Only applied to products.
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 8;
}
