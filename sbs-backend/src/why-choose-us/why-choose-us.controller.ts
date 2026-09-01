import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { WhyChooseUsService } from './why-choose-us.service';

@Controller('why-choose-us')
export class WhyChooseUsController {
  constructor(private readonly service: WhyChooseUsService) {}

  @Public()
  @Get()
  get() {
    return this.service.get();
  }

  @Put()
  update(@Body() dto: { title: string; description: string; keys: { icon: string; title: string; description: string }[] }) {
    return this.service.update(dto);
  }
}
