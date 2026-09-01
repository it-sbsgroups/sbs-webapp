import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCarouselSlideDto,
  UpdateCarouselSlideDto,
  UpdateCarouselSettingsDto,
} from './dto/carousel.dto';

const SETTINGS_ID = 'default';

@Injectable()
export class CarouselService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Slides ----------------

  /** All slides (admin), ordered. */
  findAllSlides() {
    return this.prisma.carouselSlide.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** Only active slides (public homepage), ordered. */
  findActiveSlides() {
    return this.prisma.carouselSlide.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOneSlide(id: string) {
    const slide = await this.prisma.carouselSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException('Carousel slide not found');
    return slide;
  }

  async createSlide(dto: CreateCarouselSlideDto) {
    // Default new slides to the end of the list if no order given.
    let order = dto.order;
    if (order === undefined || order === null) {
      const last = await this.prisma.carouselSlide.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (last?.order ?? -1) + 1;
    }
    return this.prisma.carouselSlide.create({ data: { ...dto, order } });
  }

  async updateSlide(id: string, dto: UpdateCarouselSlideDto) {
    await this.findOneSlide(id);
    return this.prisma.carouselSlide.update({ where: { id }, data: dto });
  }

  async removeSlide(id: string) {
    await this.findOneSlide(id);
    await this.prisma.carouselSlide.delete({ where: { id } });
    return { success: true };
  }

  async toggleActive(id: string) {
    const slide = await this.findOneSlide(id);
    return this.prisma.carouselSlide.update({
      where: { id },
      data: { isActive: !slide.isActive },
    });
  }

  /** Bulk reorder: [{ id, order }] applied in one transaction. */
  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.carouselSlide.update({
          where: { id: it.id },
          data: { order: it.order },
        }),
      ),
    );
    return this.findAllSlides();
  }

  // ---------------- Settings (singleton) ----------------

  async getSettings() {
    const existing = await this.prisma.carouselSettings.findFirst();
    if (existing) return existing;
    return this.prisma.carouselSettings.create({ data: { id: SETTINGS_ID } });
  }

  async updateSettings(dto: UpdateCarouselSettingsDto) {
    await this.getSettings(); // ensure the row exists
    return this.prisma.carouselSettings.update({
      where: { id: SETTINGS_ID },
      data: dto,
    });
  }

  // ---------------- Combined (public) ----------------

  async getPublic() {
    const [slides, settings] = await Promise.all([
      this.findActiveSlides(),
      this.getSettings(),
    ]);
    return { slides, settings };
  }
}
