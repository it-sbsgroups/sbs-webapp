import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: any) {
    return this.brandsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.brandsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}