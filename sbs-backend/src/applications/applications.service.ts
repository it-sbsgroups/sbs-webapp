import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

// A reference to an Application coming from the product form — either an
// existing application picked from the list ({ id }) or a brand-new one
// typed by the admin on the fly ({ name }).
export interface ApplicationRef {
  id?: string;
  name?: string;
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive = false) {
    return this.prisma.application.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async create(dto: CreateApplicationDto) {
    const name = dto.name.trim();
    // MySQL's utf8mb4_unicode_ci collation makes this comparison
    // case-insensitive already, so "Automotive" and "automotive" collide.
    const existing = await this.prisma.application.findFirst({ where: { name } });
    if (existing) {
      throw new ConflictException('An application with this name already exists');
    }
    return this.prisma.application.create({
      data: { name, isActive: dto.isActive ?? true },
    });
  }

  async update(id: string, dto: UpdateApplicationDto) {
    await this.findOne(id);
    const data: { name?: string; isActive?: boolean } = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.application.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    // Implicit m2m rows in _ProductApplications are cleaned up automatically
    // by Prisma/the FK's ON DELETE CASCADE — no need to touch products here.
    return this.prisma.application.delete({ where: { id } });
  }

  /**
   * Resolves a mixed list of { id } (existing) / { name } (existing-by-name
   * or brand-new custom) refs into concrete Application ids, creating any
   * brand-new names on the fly. This is what lets a product be saved with a
   * mix of picked and freshly-typed application areas in a single request.
   */
  async findOrCreateByRefs(refs: ApplicationRef[] = []): Promise<{ id: string }[]> {
    const ids: string[] = [];

    for (const ref of refs) {
      if (ref.id) {
        ids.push(ref.id);
        continue;
      }

      const name = ref.name?.trim();
      if (!name) continue;

      const existing = await this.prisma.application.findFirst({ where: { name } });
      if (existing) {
        ids.push(existing.id);
      } else {
        const created = await this.prisma.application.create({ data: { name } });
        ids.push(created.id);
      }
    }

    // De-dupe while keeping Prisma's connect payload shape.
    return [...new Set(ids)].map((id) => ({ id }));
  }
}
