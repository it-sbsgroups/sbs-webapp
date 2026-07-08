import { IsString, IsOptional, IsIn } from 'class-validator';

export class WebhookUpdateDto {
  @IsString()
  rfqId: string; // The internal ID of the RFQ (you can also use reference if needed)

  @IsOptional()
  @IsIn(['PENDING', 'REPLIED', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}