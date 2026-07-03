import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
  IsBoolean,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Define roles enum
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

/**
 * Normalises empty strings ("") and whitespace-only strings to `undefined`
 * BEFORE validation runs. This is the key fix:
 *   @IsOptional() only skips validation when the value is undefined/null,
 *   NOT when it is "". Without this, an empty optional field like aadhar=""
 *   fails its @Matches() regex and the whole request 400s silently.
 */
function EmptyToUndefined() {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  });
}

// XSS sanitisation — runs AFTER EmptyToUndefined (decorators apply bottom-up,
// so place @Sanitize() ABOVE @EmptyToUndefined() on each field).
function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const sanitized = value
      .replace(/<[^>]*>/g, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/\b(alert|eval|prompt|confirm)\s*\(/gi, '')
      .replace(/\b(document|window)\.\w+/gi, '')
      .replace(/\b(DROP\s+TABLE|DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+SET|UNION\s+SELECT)/gi, '')
      .replace(/[<>]/g, '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return sanitized;
  });
}

export class CreateEmployeeDto {
  // ==================== NAME FIELDS ====================
  @ApiProperty({ description: 'First name', example: 'Prem' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50)
  @Sanitize()
  firstName: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'Kumar' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Sanitize()
  @EmptyToUndefined()
  middleName?: string;

  @ApiProperty({ description: 'Last name', example: 'Sharma' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2)
  @MaxLength(50)
  @Sanitize()
  lastName: string;

  @ApiPropertyOptional({ description: 'Father name', example: 'Ram Sharma' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Sanitize()
  @EmptyToUndefined()
  fatherName?: string;

  // ==================== CONTACT (REQUIRED) ====================
  @ApiProperty({ description: 'Email address', example: 'prem@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ description: 'Mobile number (10 digits)', example: '9876543210' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be exactly 10 digits' })
  mobile: string;

  // ==================== IMAGE (REQUIRED) ====================
  // The form uploads the file to /employees/upload-image which returns a URL;
  // that URL is what lands here. Required per spec.
  @ApiProperty({ description: 'Profile image URL (Cloudinary)', example: 'https://res.cloudinary.com/.../photo.webp' })
  @IsString()
  @IsNotEmpty({ message: 'Employee photo is required' })
  image: string;

  // ==================== OPTIONAL CONTACT / SOCIAL ====================
  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @ValidateIf((o) => o.whatsapp !== undefined && o.whatsapp !== '')
  @Matches(/^[0-9]{10}$/, { message: 'WhatsApp number must be exactly 10 digits' })
  @EmptyToUndefined()
  whatsapp?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) @Sanitize() @EmptyToUndefined()
  linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) @Sanitize() @EmptyToUndefined()
  instagram?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) @Sanitize() @EmptyToUndefined()
  facebook?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) @Sanitize() @EmptyToUndefined()
  youtube?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) @Sanitize() @EmptyToUndefined()
  twitter?: string;

  // ==================== ADDRESS ====================
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  region?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  district?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Sanitize() @EmptyToUndefined()
  address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) @Sanitize() @EmptyToUndefined()
  landmark?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @ValidateIf((o) => o.zipCode !== undefined && o.zipCode !== '')
  @Matches(/^[0-9]{5,6}$/, { message: 'Invalid ZIP code format' })
  @EmptyToUndefined()
  zipCode?: string;

  // ==================== IDENTITY & BANK ====================
  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @ValidateIf((o) => o.aadhar !== undefined && o.aadhar !== '')
  @Matches(/^[0-9]{12}$/, { message: 'Aadhar number must be exactly 12 digits' })
  @EmptyToUndefined()
  aadhar?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @ValidateIf((o) => o.bankAccount !== undefined && o.bankAccount !== '')
  @Matches(/^[0-9]+$/, { message: 'Bank account must contain only numbers' })
  @EmptyToUndefined()
  bankAccount?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234' })
  @IsOptional()
  @ValidateIf((o) => o.ifsc !== undefined && o.ifsc !== '')
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC code format' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @EmptyToUndefined()
  ifsc?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  branchName?: string;

  // ==================== ROLE & DESIGNATION ====================
  @ApiPropertyOptional({ enum: EmployeeRole, default: EmployeeRole.EMPLOYEE })
  @IsOptional()
  @IsEnum(EmployeeRole, { message: 'Invalid role' })
  role?: EmployeeRole = EmployeeRole.EMPLOYEE;

  @ApiPropertyOptional({ example: 'Senior Software Developer' })
  @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  designation?: string;

  @ApiPropertyOptional({ example: 'Information Technology' })
  @IsOptional() @IsString() @MaxLength(100) @Sanitize() @EmptyToUndefined()
  department?: string;

  // ==================== STATUS ====================
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return true; // auto-active
    if (typeof value === 'string') return value === 'true';
    return value;
  })
  isActive?: boolean = true;
}