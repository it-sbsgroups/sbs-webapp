import { Module } from '@nestjs/common';
import { WhyChooseUsController } from './why-choose-us.controller';
import { WhyChooseUsService } from './why-choose-us.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhyChooseUsController],
  providers: [WhyChooseUsService],
})
export class WhyChooseUsModule {}
