import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mail: MailService,
  ) {}

  private get siteUrl() {
    return (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
  }

  // ============================================
  // LIST-VIEW HELPERS
  // ============================================
  // Derives a plain-text excerpt + cover image from the block content so the
  // list/card endpoints never need to select full block content (which can
  // be large `@db.LongText`). Kept in sync on every create/update.
  private deriveListMeta(blocks: any[] = []) {
    const textBlock = blocks.find((b) => b?.type === 'text' && b?.content);
    const imageBlock = blocks.find((b) => b?.type === 'imageRow' && b?.images?.length);
    const plainText = textBlock?.content
      ? String(textBlock.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    return {
      excerpt: plainText ? plainText.slice(0, 280) : null,
      coverImage: imageBlock?.images?.[0]?.src || null,
    };
  }

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
  async getPosts(params: { page?: number; pageSize?: number; categoryId?: string; subcategoryId?: string; status?: string; search?: string }) {
    // Convert to numbers
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const categoryId = params.categoryId;
    const subcategoryId = params.subcategoryId;
    const status = params.status;
    const search = params.search;
    
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    // List/card view only ever needs the denormalized excerpt + coverImage —
    // never the full `blocks` relation (which carries @db.LongText content
    // and can be large). This is the single biggest win for news list speed,
    // on both the admin table and the public news grid.
    const [posts, total] = await Promise.all([
      this.prisma.newsPost.findMany({
        skip: skip,        // ✅ Number
        take: pageSize,    // ✅ Number
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          isFeatured: true,
          categoryId: true,
          subcategoryId: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
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
    const { excerpt, coverImage } = this.deriveListMeta(data.blocks || []);
    
    return this.prisma.newsPost.create({
      data: {
        title: data.title,
        slug,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        allowVersioning: data.allowVersioning ?? true,
        excerpt,
        coverImage,
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
      const { excerpt, coverImage } = this.deriveListMeta(data.blocks);
      updateData.excerpt = excerpt;
      updateData.coverImage = coverImage;
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
    void this.notifications.handleNewNews({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: (post as any).excerpt ?? null,
    });

    return post;
  }

  // ============================================
  // LIKES (one per IP per article — enforced by the DB unique constraint,
  // not just checked in application code)
  // ============================================

  async toggleLike(slug: string, ip: string) {
    const post = await this.prisma.newsPost.findUnique({ where: { slug }, select: { id: true } });
    if (!post) throw new NotFoundException('Post not found');
    if (!ip) throw new BadRequestException('Could not determine your IP address');

    const existing = await this.prisma.newsLike.findUnique({
      where: { postId_ip: { postId: post.id, ip } },
    });

    if (existing) {
      // Already liked from this IP — clicking again un-likes it.
      const [, updated] = await this.prisma.$transaction([
        this.prisma.newsLike.delete({ where: { id: existing.id } }),
        this.prisma.newsPost.update({
          where: { id: post.id },
          data: { likesCount: { decrement: 1 } },
          select: { likesCount: true },
        }),
      ]);
      return { liked: false, likesCount: updated.likesCount };
    }

    try {
      const [, updated] = await this.prisma.$transaction([
        this.prisma.newsLike.create({ data: { postId: post.id, ip } }),
        this.prisma.newsPost.update({
          where: { id: post.id },
          data: { likesCount: { increment: 1 } },
          select: { likesCount: true },
        }),
      ]);
      return { liked: true, likesCount: updated.likesCount };
    } catch (e) {
      // Race condition: two requests from the same IP landed at once and
      // both passed the "existing" check above. The unique constraint
      // rejects the second insert — treat it as "already liked" rather
      // than erroring the request.
      if (e.code === 'P2002') {
        const current = await this.prisma.newsPost.findUnique({
          where: { id: post.id },
          select: { likesCount: true },
        });
        return { liked: true, likesCount: current?.likesCount ?? 0 };
      }
      throw e;
    }
  }

  async getLikeStatus(slug: string, ip: string) {
    const post = await this.prisma.newsPost.findUnique({
      where: { slug },
      select: { id: true, likesCount: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const existing = ip
      ? await this.prisma.newsLike.findUnique({ where: { postId_ip: { postId: post.id, ip } } })
      : null;
    return { liked: !!existing, likesCount: post.likesCount };
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

    const comment = await this.prisma.newsComment.create({
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
      include: { post: { select: { title: true } } },
    });

    // Best-effort — a failed confirmation email must never block the comment
    // from being saved.
    void this.mail
      .sendCommentReceived({
        name: comment.name,
        email: comment.email,
        postTitle: comment.post?.title || 'our article',
        body: comment.body,
      })
      .catch((err) => console.error('Comment-received email failed:', err.message));

    return comment;
  }

  async updateCommentStatus(id: string, status: string) {
    const updated = await this.prisma.newsComment.update({
      where: { id },
      data: { status: status as any },
      include: { post: { select: { title: true, slug: true } } },
    });

    // Notify the commenter of the moderation outcome — best-effort, never
    // blocks the status change itself.
    if (status === 'APPROVED') {
      void this.mail
        .sendCommentApproved({
          name: updated.name,
          email: updated.email,
          postTitle: updated.post?.title || 'our article',
          body: updated.body,
          articleUrl: `${this.siteUrl}/news/${updated.post?.slug || ''}`,
        })
        .catch((err) => console.error('Comment-approved email failed:', err.message));
    } else if (status === 'REJECTED') {
      void this.mail
        .sendCommentRejected({
          name: updated.name,
          email: updated.email,
          postTitle: updated.post?.title || 'our article',
          body: updated.body,
        })
        .catch((err) => console.error('Comment-rejected email failed:', err.message));
    }

    return updated;
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
  // LATEST NEWS (sidebar widget — replaces old ad-products slot)
  // ============================================
  async getLatestNews(excludeSlug?: string, limit = 5) {
    return this.prisma.newsPost.findMany({
      where: {
        status: 'PUBLISHED',
        ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        coverImage: true,
        category: { select: { name: true } },
      },
    });
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
    // Whitelist only fields that still exist on the model — retired ad
    // fields (adsEnabled, adsMaxProducts, adsPlacement, productSuggestionMode,
    // selectedProductIds) are silently dropped if an old client still sends them.
    const clean: any = {};
    if (data.cardsPerRow !== undefined) clean.cardsPerRow = Number(data.cardsPerRow) || 3;
    if (data.cardsPerPage !== undefined) clean.cardsPerPage = Number(data.cardsPerPage) || 9;
    if (data.showSearch !== undefined) clean.showSearch = !!data.showSearch;
    if (data.showCategoryFilter !== undefined) clean.showCategoryFilter = !!data.showCategoryFilter;
    if (data.showSubcategoryFilter !== undefined) clean.showSubcategoryFilter = !!data.showSubcategoryFilter;
    if (data.carouselVisibleCards !== undefined) clean.carouselVisibleCards = Number(data.carouselVisibleCards) || 4;
    if (data.carouselTotalToPull !== undefined) clean.carouselTotalToPull = Number(data.carouselTotalToPull) || 10;
    if (data.carouselAutoPlay !== undefined) clean.carouselAutoPlay = !!data.carouselAutoPlay;
    if (data.carouselPauseOnHover !== undefined) clean.carouselPauseOnHover = !!data.carouselPauseOnHover;
    if (data.carouselIntervalMs !== undefined) clean.carouselIntervalMs = Number(data.carouselIntervalMs) || 3000;
    if (data.commentsRequireApproval !== undefined) clean.commentsRequireApproval = !!data.commentsRequireApproval;
    if (data.commentsAllowReplies !== undefined) clean.commentsAllowReplies = !!data.commentsAllowReplies;
    if (data.latestNewsEnabled !== undefined) clean.latestNewsEnabled = !!data.latestNewsEnabled;
    if (data.latestNewsCount !== undefined) clean.latestNewsCount = Number(data.latestNewsCount) || 5;

    return this.prisma.newsSettings.upsert({
      where: { id: 'default' },
      create: { ...clean, id: 'default' },
      update: clean,
    });
  }
}