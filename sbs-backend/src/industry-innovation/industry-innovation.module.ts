import { Module } from '@nestjs/common';
import { IndustryInnovationService } from './industry-innovation.service';
import { IndustryInnovationController } from './industry-innovation.controller';

@Module({
  controllers: [IndustryInnovationController],
  providers: [IndustryInnovationService],
})
export class IndustryInnovationModule {}