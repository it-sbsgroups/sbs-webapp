import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AskFaqDto {
  @IsString()
  @IsNotEmpty({ message: 'Please enter your name.' })
  @MaxLength(120, { message: 'Name must be 120 characters or fewer.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @MaxLength(254)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Question cannot be empty.' })
  @MinLength(10, { message: 'Please write at least 10 characters so we understand your question.' })
  @MaxLength(1000, { message: 'Question must be 1 000 characters or fewer.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  question: string;
}

export class AnswerFaqDto {
  @IsString()
  @IsNotEmpty({ message: 'Answer cannot be empty.' })
  @MinLength(5, { message: 'Answer must be at least 5 characters.' })
  // No MaxLength — answers may include rich HTML / Cloudinary image markup
  answer: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isListedOnFaqPage?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isFeaturedInComponent?: boolean;
}

export class CreateAdminFaqDto {
  @IsString()
  @IsNotEmpty({ message: 'Question cannot be empty.' })
  @MinLength(5)
  @MaxLength(1000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  question: string;

  @IsString()
  @IsNotEmpty({ message: 'Answer cannot be empty.' })
  @MinLength(5)
  answer: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isListedOnFaqPage?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isFeaturedInComponent?: boolean;
}

export class QueryFaqDto {
  /** Free-text search across question + answer fields */
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @IsString()
  @IsOptional()
  status?: 'pending' | 'approved' | 'all';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value) || 1)
  page?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value) || 20)
  pageSize?: number;
}