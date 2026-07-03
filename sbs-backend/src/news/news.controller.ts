import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================
  @Public()
  @Get('public/posts')
  getPublicPosts(@Query() query: any) {
    return this.newsService.getPosts({ ...query, status: 'PUBLISHED' });
  }

  @Public()
  @Get('public/posts/:slug')
  getPublicPostBySlug(@Param('slug') slug: string) {
    return this.newsService.getPostBySlug(slug);
  }

  @Public()
  @Post('public/comments')
  @HttpCode(HttpStatus.CREATED)
  createPublicComment(@Body() data: any) {
    return this.newsService.createComment(data);
  }

  // ============================================
  // CATEGORIES
  // ============================================
  @Public()
  @Get('categories')
  getCategories() {
    return this.newsService.getCategories();
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  createCategory(@Body() data: any) {
    return this.newsService.createCategory(data);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.newsService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id') id: string) {
    return this.newsService.deleteCategory(id);
  }

  // ============================================
  // SUBCATEGORIES
  // ============================================
  @Public()
  @Get('subcategories')
  getSubcategories(@Query('categoryId') categoryId?: string) {
    return this.newsService.getSubcategories(categoryId);
  }

  @Post('subcategories')
  @HttpCode(HttpStatus.CREATED)
  createSubcategory(@Body() data: any) {
    return this.newsService.createSubcategory(data);
  }

  @Put('subcategories/:id')
  updateSubcategory(@Param('id') id: string, @Body() data: any) {
    return this.newsService.updateSubcategory(id, data);
  }

  @Delete('subcategories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSubcategory(@Param('id') id: string) {
    return this.newsService.deleteSubcategory(id);
  }

  // ============================================
  // POSTS (ADMIN)
  // ============================================
  @Get('posts')
  getPosts(@Query() query: any) {
    return this.newsService.getPosts(query);
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.newsService.getPost(id);
  }

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() data: any) {
    return this.newsService.createPost(data);
  }

  @Put('posts/:id')
  updatePost(@Param('id') id: string, @Body() data: any) {
    return this.newsService.updatePost(id, data);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('id') id: string) {
    return this.newsService.deletePost(id);
  }

  @Put('posts/:id/publish')
  publishPost(@Param('id') id: string) {
    return this.newsService.publishPost(id);
  }

  // ============================================
  // COMMENTS
  // ============================================
  @Get('comments')
  getComments(@Query() query: any) {
    return this.newsService.getComments(query);
  }

  @Put('comments/:id/status')
  updateCommentStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.newsService.updateCommentStatus(id, status);
  }

  @Put('comments/:id/soft-delete')
  softDeleteComment(@Param('id') id: string) {
    return this.newsService.softDeleteComment(id);
  }

  @Put('comments/:id/restore')
  restoreComment(@Param('id') id: string) {
    return this.newsService.restoreComment(id);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  hardDeleteComment(@Param('id') id: string) {
    return this.newsService.hardDeleteComment(id);
  }

  // ============================================
  // AD PRODUCTS
  // ============================================
  @Get('posts/:id/ad-products')
  getAdProducts(@Param('id') id: string) {
    return this.newsService.getAdProducts(id);
  }

  @Put('posts/:id/ad-products')
  updateAdProducts(@Param('id') id: string, @Body() data: { productIds: string[] }) {
    return this.newsService.updateAdProducts(id, data.productIds);
  }

  // ============================================
  // SETTINGS
  // ============================================
  @Public()
  @Get('settings')
  getSettings() {
    return this.newsService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() data: any) {
    return this.newsService.updateSettings(data);
  }
}