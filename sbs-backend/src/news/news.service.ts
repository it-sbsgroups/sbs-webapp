import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ============================================
  // CATEGORIES
  // ============================================
  async getCategories() {
    return this.prisma.newsCategory.findMany({
      include: { _count: { select: { posts: true, subcategories: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(data: { name: string; icon?: string }) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.newsCategory.create({ data: { ...data, slug } });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.newsCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.newsCategory.delete({ where: { id } });
  }

  // ============================================
  // SUBCATEGORIES
  // ============================================
  async getSubcategories(categoryId?: string) {
    return this.prisma.newsSubcategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createSubcategory(data: { name: string; categoryId: string }) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.newsSubcategory.create({ data: { ...data, slug } });
  }

  async updateSubcategory(id: string, data: any) {
    return this.prisma.newsSubcategory.update({ where: { id }, data });
  }

  async deleteSubcategory(id: string) {
    return this.prisma.newsSubcategory.delete({ where: { id } });
  }

  // ============================================
  // POSTS
  // ============================================
  async getPosts(params: { page?: number; pageSize?: number; categoryId?: string; status?: string; search?: string }) {
    // Convert to numbers
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const categoryId = params.categoryId;
    const status = params.status;
    const search = params.search;
    
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      this.prisma.newsPost.findMany({
        skip: skip,        // ✅ Number
        take: pageSize,    // ✅ Number
        where,
        include: {
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
          blocks: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsPost.count({ where }),
    ]);

    return { data: posts, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async getPost(id: string) {
    const post = await this.prisma.newsPost.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        blocks: { orderBy: { sortOrder: 'asc' } },
        versions: { orderBy: { createdAt: 'desc' } },
        adProducts: true,
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.newsPost.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        blocks: { orderBy: { sortOrder: 'asc' } },
        comments: {
          where: { parentId: null, isHardDeleted: false },
          include: {
            replies: {
              where: { isHardDeleted: false },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(data: {
    title: string;
    categoryId: string;
    subcategoryId?: string;
    allowVersioning?: boolean;
    blocks?: any[];
  }) {
    const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    return this.prisma.newsPost.create({
      data: {
        title: data.title,
        slug,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        allowVersioning: data.allowVersioning ?? true,
        blocks: data.blocks?.length ? {
          create: data.blocks.map((block, i) => ({
            type: block.type || 'text',
            content: block.content || '',
            style: block.style || {},
            images: block.images || [],
            sortOrder: i,
          })),
        } : undefined,
      },
      include: { blocks: true },
    });
  }

  async updatePost(id: string, data: any) {
    const post = await this.getPost(id);

    // Create version snapshot if versioning enabled
    if (post.allowVersioning && data.blocks) {
      await this.prisma.newsVersion.create({
        data: {
          postId: id,
          version: (await this.prisma.newsVersion.count({ where: { postId: id } })) + 1,
          title: post.title,
          blocks: post.blocks,
          editorNote: data.editorNote || 'Content updated',
        },
      });
    }

    // Delete old blocks if new ones provided
    if (data.blocks) {
      await this.prisma.newsBlock.deleteMany({ where: { postId: id } });
    }

    const updateData: any = {};
    if (data.title) {
      updateData.title = data.title;
      updateData.slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    }
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.subcategoryId !== undefined) updateData.subcategoryId = data.subcategoryId;
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') updateData.publishedAt = new Date();
    }
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    if (data.blocks?.length) {
      updateData.blocks = {
        create: data.blocks.map((block, i) => ({
          type: block.type || 'text',
          content: block.content || '',
          style: block.style || {},
          images: block.images || [],
          sortOrder: i,
        })),
      };
    }

    return this.prisma.newsPost.update({
      where: { id },
      data: updateData,
      include: { blocks: true },
    });
  }

  async deletePost(id: string) {
    return this.prisma.newsPost.delete({ where: { id } });
  }

  async publishPost(id: string) {
    const post = await this.prisma.newsPost.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    // Alert subscribers who opted into news emails (non-blocking).
    void this.notifications.notifyNewNews({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: (post as any).excerpt ?? null,
    });

    return post;
  }

  // ============================================
  // COMMENTS
  // ============================================
  async getComments(params: { postId?: string; page?: number; pageSize?: number }) {
    // Convert to numbers (query params come as strings!)
    const postId = params.postId;
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 50;

    const where: any = { isHardDeleted: false };
    if (postId) where.postId = postId;

    const skip = (page - 1) * pageSize;

    const [comments, total] = await Promise.all([
      this.prisma.newsComment.findMany({
        skip: skip,        // ✅ Now a number
        take: pageSize,    // ✅ Now a number
        where,
        include: {
          post: { select: { id: true, title: true } },
          replies: { where: { isHardDeleted: false } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsComment.count({ where }),
    ]);

    return { data: comments, meta: { total, page, pageSize } };
  }

  async createComment(data: {
    postId: string;
    parentId?: string;
    name: string;
    email: string;
    body: string;
    geolocation?: any;
  }) {
    const parent = data.parentId ? await this.prisma.newsComment.findUnique({ where: { id: data.parentId } }) : null;
    const depth = parent ? parent.depth + 1 : 0;

    return this.prisma.newsComment.create({
      data: {
        postId: data.postId,
        parentId: data.parentId,
        name: data.name,
        email: data.email,
        body: data.body,
        depth,
        geolocation: data.geolocation,
        status: 'PENDING',
      },
    });
  }

  async updateCommentStatus(id: string, status: string) {
    return this.prisma.newsComment.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async softDeleteComment(id: string) {
    return this.prisma.newsComment.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async restoreComment(id: string) {
    return this.prisma.newsComment.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  async hardDeleteComment(id: string) {
    return this.prisma.newsComment.update({
      where: { id },
      data: { isHardDeleted: true },
    });
  }

  // ============================================
  // AD PRODUCTS
  // ============================================
  async getAdProducts(postId: string) {
    return this.prisma.newsAdProduct.findMany({ where: { postId } });
  }

  async updateAdProducts(postId: string, productIds: string[]) {
    await this.prisma.newsAdProduct.deleteMany({ where: { postId } });
    if (productIds.length > 0) {
      await this.prisma.newsAdProduct.createMany({
        data: productIds.map((productId) => ({ postId, productId })),
      });
    }
    return this.prisma.newsAdProduct.findMany({ where: { postId } });
  }

  // ============================================
  // SETTINGS
  // ============================================
  async getSettings() {
    let settings = await this.prisma.newsSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.newsSettings.create({ data: { id: 'default' } });
    }
    return settings;
  }

  async updateSettings(data: any) {
    // Ensure selectedProductIds is stored as JSON
    if (data.selectedProductIds && !Array.isArray(data.selectedProductIds)) {
      data.selectedProductIds = [];
    }
    
    return this.prisma.newsSettings.upsert({
      where: { id: 'default' },
      create: { 
        ...data, 
        id: 'default',
        cardsPerRow: Number(data.cardsPerRow) || 3,
        cardsPerPage: Number(data.cardsPerPage) || 9,
        carouselVisibleCards: Number(data.carouselVisibleCards) || 4,
        carouselTotalToPull: Number(data.carouselTotalToPull) || 10,
        carouselIntervalMs: Number(data.carouselIntervalMs) || 3000,
        adsMaxProducts: Number(data.adsMaxProducts) || 4,
      },
      update: {
        ...data,
        cardsPerRow: Number(data.cardsPerRow) || 3,
        cardsPerPage: Number(data.cardsPerPage) || 9,
        carouselVisibleCards: Number(data.carouselVisibleCards) || 4,
        carouselTotalToPull: Number(data.carouselTotalToPull) || 10,
        carouselIntervalMs: Number(data.carouselIntervalMs) || 3000,
        adsMaxProducts: Number(data.adsMaxProducts) || 4,
      },
    });
  }
}