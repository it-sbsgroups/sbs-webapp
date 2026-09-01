import { PartialType } from '@nestjs/swagger';
import { CreateIndustryInnovationKeyDto } from './create-industry-innovation-key.dto';

export class UpdateIndustryInnovationKeyDto extends PartialType(CreateIndustryInnovationKeyDto) {}