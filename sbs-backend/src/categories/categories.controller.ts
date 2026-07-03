import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get('subcategories/all')
  findAllSubcategories(@Query('categoryId') categoryId?: string) {
    return this.categoriesService.findAllSubcategories(categoryId);
  }

  @Public()
  @Get('subcategories/:id')
  findOneSubcategory(@Param('id') id: string) {
    return this.categoriesService.findOneSubcategory(id);
  }

  @Post('subcategories')
  @HttpCode(HttpStatus.CREATED)
  createSubcategory(@Body() data: { name: string; categoryId: string; image?: string }) {
    return this.categoriesService.createSubcategory(data);
  }

  @Put('subcategories/:id')
  updateSubcategory(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.updateSubcategory(id, data);
  }

  @Delete('subcategories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSubcategory(@Param('id') id: string) {
    return this.categoriesService.removeSubcategory(id);
  }

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: { name: string; image?: string; icon?: string; description?: string }) {
    return this.categoriesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}