import { PartialType } from '@nestjs/swagger';
import { CreateIndustryInnovationDto } from './create-industry-innovation.dto';

export class UpdateIndustryInnovationDto extends PartialType(CreateIndustryInnovationDto) {}