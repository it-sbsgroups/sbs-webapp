import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Normalises empty/whitespace-only strings to `undefined` before validation
 * runs, so an empty optional field doesn't fail its own validators.
 */
function EmptyToUndefined() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  });
}

// XSS sanitisation for free-text fields.
function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/\b(alert|eval|prompt|confirm)\s*\(/gi, '')
      .replace(/\b(document|window)\.\w+/gi, '')
      .replace(/[<>]/g, '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  });
}

/**
 * Matches the real Employee Prisma model exactly: name, email, mobile,
 * image, designation, department, isActive. Nothing else — a previous
 * version of this DTO collected firstName/lastName/fatherName/aadhar/bank
 * details/address/social links, none of which exist as columns on the
 * table, so every create() call using them crashed with a Prisma
 * "Unknown argument" error.
 */
export class CreateEmployeeDto {
  @ApiProperty({ description: 'Full name', example: 'Rohan Mehta' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(149)
  @Sanitize()
  name: string;

  @ApiProperty({ description: 'Email address', example: 'rohan@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ description: 'Mobile number (10 digits)', example: '9876543210' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be exactly 10 digits' })
  mobile: string;

  @ApiPropertyOptional({ description: 'Profile image URL (Cloudinary)' })
  @IsOptional()
  @IsString()
  @EmptyToUndefined()
  image?: string;

  @ApiPropertyOptional({ example: 'Senior Software Developer' })
  @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  designation?: string;

  @ApiPropertyOptional({ example: 'Information Technology' })
  @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  department?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value === 'string') return value === 'true';
    return value;
  })
  isActive?: boolean = true;
}
