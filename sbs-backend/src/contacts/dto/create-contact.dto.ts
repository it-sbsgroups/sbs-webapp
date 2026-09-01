import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString() @IsNotEmpty() @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail() @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString() @MaxLength(30)
  phone: string;

  @ApiProperty({ example: 'Acme Inc.' })
  @IsString() @MaxLength(255)
  companyName: string;

  @ApiProperty({ example: 'Partnership enquiry' })
  @IsString() @MaxLength(255)
  subject: string;

  @ApiProperty({ example: 'I would like to discuss...' })
  @IsString() @MinLength(10)
  message: string;
}