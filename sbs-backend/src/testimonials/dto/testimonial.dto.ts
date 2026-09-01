import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Manual passcode issuance — used when an admin types in a company name/email
 * by hand instead of picking an existing Client/Brand record.
 */
export class IssuePasscodeDto {
  @IsString()
  companyName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class SubmitTestimonialDto {
  @IsString()
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(10)
  testimony!: string;
}

export class UpdateTestimonialStatusDto {
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'REWRITE'])
  status!: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REWRITE';
}
