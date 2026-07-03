import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEAM_LEAD = 'team_lead',
  EMPLOYEE = 'employee',
  INTERN = 'intern',
  HR = 'hr',
  ACCOUNTANT = 'accountant',
  SUPERVISOR = 'supervisor',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryEmployeeDto {
  @ApiPropertyOptional({ description: 'Search term for name, email, mobile, aadhar' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by district' })
  @IsString()
  @IsOptional()
  district?: string;

  // 🆕 Role filter
  @ApiPropertyOptional({ 
    description: 'Filter by role',
    enum: EmployeeRole
  })
  @IsEnum(EmployeeRole)
  @IsOptional()
  role?: EmployeeRole;

  // 🆕 Department filter
  @ApiPropertyOptional({ description: 'Filter by department' })
  @IsString()
  @IsOptional()
  department?: string;

  // 🆕 Designation filter - THIS WAS MISSING!
  @ApiPropertyOptional({ description: 'Filter by designation' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Page number (starts from 1)', default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sort field', 
    default: 'createdAt',
    enum: ['firstName', 'lastName', 'email', 'mobile', 'createdAt', 'updatedAt', 'state', 'city', 'role', 'designation', 'department']
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}