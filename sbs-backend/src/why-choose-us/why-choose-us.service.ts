import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface KeyInput { icon: string; title: string; description: string; }
interface UpdateInput { title: string; description: string; keys: KeyInput[]; }

@Injectable()
export class WhyChooseUsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let row = await this.prisma.whyChooseUs.findFirst({
      where: { isDeleted: false },
      include: { keys: { where: { isDeleted: false }, orderBy: { createdAt: 'asc' } } },
    });
    if (!row) {
      row = await this.prisma.whyChooseUs.create({
        data: {
          title: 'Why Choose Us',
          description: 'What sets us apart as your industrial supply partner.',
        },
        include: { keys: true },
      });
    }
    return row;
  }

  async update(dto: UpdateInput) {
    const existing = await this.get();

    await this.prisma.whyChooseUs.update({
      where: { id: existing.id },
      data: { title: dto.title, description: dto.description },
    });

    // Replace keys wholesale — simplest consistent way to handle add/edit/remove/reorder in one save.
    await this.prisma.whyChooseUsKey.updateMany({
      where: { WhyChooseUsId: existing.id },
      data: { isDeleted: true },
    });
    if (dto.keys?.length) {
      await this.prisma.whyChooseUsKey.createMany({
        data: dto.keys.map((k) => ({
          WhyChooseUsId: existing.id,
          icon: k.icon || '⭐',
          title: k.title,
          description: k.description,
        })),
      });
    }

    return this.get();
  }
}
