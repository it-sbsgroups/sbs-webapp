import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuerySearchDto } from './dto/query-search.dto';

const MIN_QUERY_LENGTH = 2;
// How many rows per bucket to show in the mixed "all" preview (header dropdown).
const PREVIEW_TAKE = 5;

type Bucket<T> = { data: T[]; total: number; page: number; pageSize: number; totalPages: number };

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: QuerySearchDto) {
    const q = (query.q || '').trim();
    const type = query.type || 'all';
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(Math.max(1, Number(query.pageSize) || 8), 50);

    // Below the minimum length we return an empty (but well-formed) result
    // instead of dumping the entire catalogue.
    if (q && q.length < MIN_QUERY_LENGTH) {
      return this.emptyResponse(q, page, pageSize);
    }

    const wantProducts = type === 'all' || type === 'products';
    const wantNews = type === 'all' || type === 'news';
    const wantBrands = type === 'all' || type === 'brands';

    // "all" mode is a small cross-entity preview; a specific type gets the
    // real paginated page the results screen scrolls/pages through.
    const isPreview = type === 'all';
    const take = isPreview ? PREVIEW_TAKE : pageSize;
    const skip = isPreview ? 0 : (page - 1) * pageSize;

    const productWhere = this.productWhere(q, query.categoryId, query.subcategoryId, query.brandId);
    const newsWhere = this.newsWhere(q);
    const brandWhere = this.brandWhere(q);

    const [productRows, productsTotal, newsRows, newsTotal, brandRows, brandsTotal] = await Promise.all([
      wantProducts
        ? this.prisma.product.findMany({
            where: productWhere,
            skip,
            take,
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
              brand: { select: { name: true } },
              category: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
      wantProducts ? this.prisma.product.count({ where: productWhere }) : Promise.resolve(0),

      wantNews
        ? this.prisma.newsPost.findMany({
            where: newsWhere,
            skip,
            take,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImage: true,
              publishedAt: true,
              category: { select: { name: true } },
            },
            orderBy: { publishedAt: 'desc' },
          })
        : Promise.resolve([]),
      wantNews ? this.prisma.newsPost.count({ where: newsWhere }) : Promise.resolve(0),

      wantBrands
        ? this.prisma.brand.findMany({
            where: brandWhere,
            skip,
            take,
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              isOwnBrand: true,
              _count: { select: { products: true } },
            },
            orderBy: { name: 'asc' },
          })
        : Promise.resolve([]),
      wantBrands ? this.prisma.brand.count({ where: brandWhere }) : Promise.resolve(0),
    ]);

    const bucketPage = isPreview ? 1 : page;
    const bucketSize = isPreview ? PREVIEW_TAKE : pageSize;

    return {
      query: q,
      counts: {
        products: productsTotal,
        news: newsTotal,
        brands: brandsTotal,
        total: productsTotal + newsTotal + brandsTotal,
      },
      results: {
        products: this.toBucket(productRows.map((p) => this.mapProduct(p)), productsTotal, bucketPage, bucketSize),
        news: this.toBucket(newsRows.map((n) => this.mapNews(n)), newsTotal, bucketPage, bucketSize),
        brands: this.toBucket(brandRows.map((b) => this.mapBrand(b)), brandsTotal, bucketPage, bucketSize),
      },
    };
  }

  // ==========================================================================
  // ADMIN SEARCH — same shape/UX as the public search above, but:
  //  (a) queries the live database directly (the old admin search searched a
  //      frozen snapshot of the pre-database static JS data files, so it
  //      never reflected anything added/edited after the app started), and
  //  (b) includes inactive/draft/unpublished rows too, plus entities that
  //      only matter internally (clients, employees), since an admin needs
  //      to find things regardless of their public visibility.
  // ==========================================================================

  async adminSearch(q: string, limit = 20) {
    const query = (q || '').trim();
    if (query.length < MIN_QUERY_LENGTH) return { query, results: [] };

    const [products, news, brands, clients, employees] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { model: { contains: query } },
            { manufacturer: { contains: query } },
          ],
        },
        take: limit,
        select: { id: true, name: true, sku: true, brand: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsPost.findMany({
        where: { OR: [{ title: { contains: query } }, { excerpt: { contains: query } }] },
        take: limit,
        select: { id: true, title: true, status: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.brand.findMany({
        where: { name: { contains: query } },
        take: limit,
        select: { id: true, name: true, isOwnBrand: true, isActive: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.client.findMany({
        where: { OR: [{ companyName: { contains: query } }, { contactName: { contains: query } }, { email: { contains: query } }] },
        take: limit,
        select: { id: true, companyName: true, contactName: true },
        orderBy: { companyName: 'asc' },
      }),
      this.prisma.employee.findMany({
        where: { OR: [{ name: { contains: query } }, { email: { contains: query } }, { department: { contains: query } }] },
        take: limit,
        select: { id: true, name: true, designation: true, department: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const results = [
      ...products.map((p) => ({
        type: 'product',
        id: p.id,
        title: p.name,
        subtitle: [p.brand?.name, p.sku].filter(Boolean).join(' · '),
        href: `/admin/products?edit=${p.id}`,
      })),
      ...news.map((n) => ({
        type: 'news',
        id: n.id,
        title: n.title,
        subtitle: n.status === 'PUBLISHED' ? 'Published' : n.status === 'DRAFT' ? 'Draft' : 'Archived',
        href: `/admin/news?edit=${n.id}`,
      })),
      ...brands.map((b) => ({
        type: 'brand',
        id: b.id,
        title: b.name,
        subtitle: `${b.isOwnBrand ? 'Own Brand' : 'Distributor'}${b.isActive ? '' : ' · Inactive'}`,
        href: `/admin/distributors?edit=${b.id}`,
      })),
      ...clients.map((c) => ({
        type: 'client',
        id: c.id,
        title: c.companyName,
        subtitle: c.contactName || 'Client',
        href: `/admin/clients?edit=${c.id}`,
      })),
      ...employees.map((e) => ({
        type: 'employee',
        id: e.id,
        title: e.name,
        subtitle: [e.designation, e.department].filter(Boolean).join(' · '),
        href: `/admin/employees?edit=${e.id}`,
      })),
    ];

    return { query, results: results.slice(0, limit * 2) };
  }

  // ---- WHERE builders ------------------------------------------------------

  private productWhere(
    q: string,
    categoryId?: string,
    subcategoryId?: string,
    brandId?: string,
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (brandId) where.brandId = brandId;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { model: { contains: q } },
        { keyFeatures: { contains: q } },
        { manufacturer: { contains: q } },
        { description: { contains: q } },
      ];
    }
    return where;
  }

  private newsWhere(q: string): Prisma.NewsPostWhereInput {
    const where: Prisma.NewsPostWhereInput = { status: 'PUBLISHED' };
    if (q) {
      where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];
    }
    return where;
  }

  private brandWhere(q: string): Prisma.BrandWhereInput {
    const where: Prisma.BrandWhereInput = { isActive: true };
    if (q) {
      where.OR = [{ name: { contains: q } }];
    }
    return where;
  }

  // ---- Mappers: DB row -> flat, UI-ready search hit ------------------------

  private mapProduct(p: any) {
    return {
      type: 'product' as const,
      id: p.id,
      title: p.name,
      subtitle: [p.brand?.name, p.model].filter(Boolean).join(' · ') || p.category?.name || '',
      image: p.images?.[0]?.url || null,
      href: `/products/${p.id}`,
    };
  }

  private mapNews(n: any) {
    return {
      type: 'news' as const,
      id: n.id,
      title: n.title,
      subtitle: n.category?.name || (n.excerpt ? String(n.excerpt).slice(0, 80) : ''),
      image: n.coverImage || null,
      href: `/news/${n.slug}`,
    };
  }

  private mapBrand(b: any) {
    return {
      type: 'brand' as const,
      id: b.id,
      title: b.name,
      subtitle: `${b.isOwnBrand ? 'Own Brand' : 'Distributor Brand'} · ${b._count?.products ?? 0} products`,
      image: b.logo || null,
      href: `/brands/${b.slug}`,
    };
  }

  private toBucket<T>(data: T[], total: number, page: number, pageSize: number): Bucket<T> {
    return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  private emptyResponse(q: string, page: number, pageSize: number) {
    const empty = this.toBucket([], 0, page, pageSize);
    return {
      query: q,
      counts: { products: 0, news: 0, brands: 0, total: 0 },
      results: { products: empty, news: empty, brands: empty },
    };
  }
}
