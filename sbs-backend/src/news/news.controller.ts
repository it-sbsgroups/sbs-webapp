import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Ip, Res } from '@nestjs/common';
import type { Response } from 'express';
import { NewsService } from './news.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ============================================
  // IMPORT / EXPORT / TEMPLATE (mirrors /products/export/csv + bulk-import)
  // ============================================
  @Get('export/csv')
  async exportCSV(@Res() res: Response) {
    const data = await this.newsService.exportToCSV();
    const headers = Object.keys(data[0] || { Title: '', Category: '', Excerpt: '' }).join(',');
    const rows = data.map((row: any) =>
      Object.values(row).map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','),
    );
    const csv = '\uFEFF' + [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=news_export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }

  @Get('export/template')
  async downloadTemplate(@Res() res: Response) {
    const headers = ['Title', 'Category', 'Excerpt'];
    const sample = ['"Sample Article Title"', '"Company Updates"', '"One paragraph summary of the article body."'];
    const csv = '\uFEFF' + [headers.join(','), sample.join(',')].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=news_import_template.csv');
    res.send(csv);
  }

  @Post('bulk-import')
  async bulkImport(@Body() body: { posts: Array<Record<string, any>> }) {
    return this.newsService.bulkImportPosts(body.posts || []);
  }

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

  // IP comes from @Ip() — trusted, server-determined (see main.ts trust
  // proxy setup) — never taken from anything the client sends, or the
  // "one like per IP" rule would be trivially spoofable.
  @Public()
  @Post('public/posts/:slug/like')
  @HttpCode(HttpStatus.OK)
  toggleLike(@Param('slug') slug: string, @Ip() ip: string) {
    return this.newsService.toggleLike(slug, ip);
  }

  @Public()
  @Get('public/posts/:slug/like-status')
  getLikeStatus(@Param('slug') slug: string, @Ip() ip: string) {
    return this.newsService.getLikeStatus(slug, ip);
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
  // LATEST NEWS (sidebar widget — replaces old ad-products slot)
  // ============================================
  @Public()
  @Get('public/latest')
  getLatestNews(@Query('excludeSlug') excludeSlug?: string, @Query('limit') limit?: string) {
    return this.newsService.getLatestNews(excludeSlug, Number(limit) || 5);
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