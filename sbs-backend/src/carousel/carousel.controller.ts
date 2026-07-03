import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CarouselService } from './carousel.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  CreateCarouselSlideDto,
  ReorderSlidesDto,
  UpdateCarouselSettingsDto,
  UpdateCarouselSlideDto,
} from './dto/carousel.dto';

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carousel: CarouselService) {}

  // ---- Public (homepage) ----

  @Public()
  @Get('public')
  getPublic() {
    return this.carousel.getPublic();
  }

  @Public()
  @Get('settings')
  getSettings() {
    return this.carousel.getSettings();
  }

  // ---- Admin: slides ----

  @Get('slides')
  findAllSlides() {
    return this.carousel.findAllSlides();
  }

  @Get('slides/:id')
  findOneSlide(@Param('id') id: string) {
    return this.carousel.findOneSlide(id);
  }

  @Post('slides')
  createSlide(@Body() dto: CreateCarouselSlideDto) {
    return this.carousel.createSlide(dto);
  }

  // Keep this BEFORE 'slides/:id' PUT so 'reorder' isn't captured as an :id.
  @Put('slides/reorder')
  reorder(@Body() dto: ReorderSlidesDto) {
    return this.carousel.reorder(dto.order);
  }

  @Put('slides/:id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.carousel.toggleActive(id);
  }

  @Put('slides/:id')
  updateSlide(@Param('id') id: string, @Body() dto: UpdateCarouselSlideDto) {
    return this.carousel.updateSlide(id, dto);
  }

  @Delete('slides/:id')
  removeSlide(@Param('id') id: string) {
    return this.carousel.removeSlide(id);
  }

  // ---- Admin: settings ----

  @Put('settings')
  updateSettings(@Body() dto: UpdateCarouselSettingsDto) {
    return this.carousel.updateSettings(dto);
  }
}
