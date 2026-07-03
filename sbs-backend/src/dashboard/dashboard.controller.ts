import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER', 'IT')
  async getStats() {
    const [
      totalRfqs,
      pendingRfqs,
      repliedRfqs,
      totalProducts,
      totalNews,
      totalSubscribers,
      totalEmployees,
      totalClients,
      totalBrands,
      totalOwnBrands,
    ] = await Promise.all([
      this.prisma.rfqRequest.count(),
      this.prisma.rfqRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.rfqRequest.count({ where: { status: 'REPLIED' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.newsPost.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
      this.prisma.employee.count(),
      this.prisma.client.count({ where: { isActive: true } }),
      this.prisma.brand.count({ where: { isActive: true } }),
      this.prisma.brand.count({ where: { isActive: true, isOwnBrand: true } }),
    ]);

    const distributorBrands = totalBrands - totalOwnBrands;

    return {
      rfq: { total: totalRfqs, pending: pendingRfqs, replied: repliedRfqs },
      products:          totalProducts,
      news:              totalNews,
      subscribers:       totalSubscribers,
      employees:         totalEmployees,
      clients:           totalClients,
      brands:            totalBrands,        // Total Brands (Distributors) — all active brands
      distributorBrands: distributorBrands,  // Pure distributor count, if needed separately
      ownBrands:         totalOwnBrands,     // Total Own Brands
    };
  }

  @Get('rfq-trend')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER', 'IT')
  async getRfqTrend(@Query('months') monthsParam?: string) {
    const months = Math.min(Math.max(Number(monthsParam) || 12, 1), 24);

    const buckets: { label: string; start: Date; end: Date }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const label = start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      buckets.push({ label, start, end });
    }

    const counts = await Promise.all(
      buckets.map(({ start, end }) =>
        this.prisma.rfqRequest.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
      ),
    );

    const pendingCounts = await Promise.all(
      buckets.map(({ start, end }) =>
        this.prisma.rfqRequest.count({
          where: { status: 'PENDING', createdAt: { gte: start, lte: end } },
        }),
      ),
    );

    const repliedCounts = await Promise.all(
      buckets.map(({ start, end }) =>
        this.prisma.rfqRequest.count({
          where: { status: 'REPLIED', createdAt: { gte: start, lte: end } },
        }),
      ),
    );

    return buckets.map(({ label }, i) => ({
      month:   label,
      total:   counts[i],
      pending: pendingCounts[i],
      replied: repliedCounts[i],
    }));
  }
}