import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

@Injectable()
export class SystemLogsService {
  private readonly logger = new Logger(SystemLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Call this from anywhere else in the backend to persist a log entry,
  // e.g. `this.systemLogs.log('ERROR', 'rfq', 'Failed to send team email', { rfqId })`.
  async log(level: LogLevel, source: string, message: string, meta?: any) {
    try {
      return await this.prisma.systemLog.create({
        data: { level, source, message, meta: meta ?? undefined },
      });
    } catch (err) {
      // Logging must never break the calling request.
      this.logger.error(`Failed to persist system log: ${err}`);
      return null;
    }
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    level?: string;
    source?: string;
    reviewed?: string; // 'true' | 'false' | undefined (=all)
    search?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 25));

    const where: any = {};
    if (params.level) where.level = params.level;
    if (params.source) where.source = params.source;
    if (params.reviewed === 'true') where.reviewed = true;
    if (params.reviewed === 'false') where.reviewed = false;
    if (params.search) {
      where.OR = [
        { message: { contains: params.search } },
        { source: { contains: params.search } },
      ];
    }

    const [data, total, unreviewedCount] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.systemLog.count({ where }),
      this.prisma.systemLog.count({ where: { reviewed: false } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        unreviewedCount,
      },
    };
  }

  async markReviewed(id: string) {
    return this.prisma.systemLog.update({
      where: { id },
      data: { reviewed: true, reviewedAt: new Date() },
    });
  }

  async markUnreviewed(id: string) {
    return this.prisma.systemLog.update({
      where: { id },
      data: { reviewed: false, reviewedAt: null },
    });
  }

  async markAllReviewed() {
    const now = new Date();
    return this.prisma.systemLog.updateMany({
      where: { reviewed: false },
      data: { reviewed: true, reviewedAt: now },
    });
  }

  async remove(id: string) {
    return this.prisma.systemLog.delete({ where: { id } });
  }

  // ── Auto-deletion rule ────────────────────────────────────────────────
  // Reviewed logs are purged 24 hours after `reviewedAt`. Runs hourly so the
  // "1 day after review" requirement never drifts by more than an hour.
  @Cron(CronExpression.EVERY_HOUR)
  async purgeReviewedLogs() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await this.prisma.systemLog.deleteMany({
      where: { reviewed: true, reviewedAt: { lte: cutoff } },
    });
    if (result.count > 0) {
      this.logger.log(`Purged ${result.count} reviewed system log(s) older than 24h.`);
    }
    return result;
  }
}
