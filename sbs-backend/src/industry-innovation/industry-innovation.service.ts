// src/industry-innovation/industry-innovation.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIndustryInnovationDto } from './dto/create-industry-innovation.dto';
import { UpdateIndustryInnovationDto } from './dto/update-industry-innovation.dto';
import { CreateIndustryInnovationKeyDto } from './dto/create-industry-innovation-key.dto';
import { UpdateIndustryInnovationKeyDto } from './dto/update-industry-innovation-key.dto';

@Injectable()
export class IndustryInnovationService {
  private readonly logger = new Logger(IndustryInnovationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===================== INNOVATION (Parent) =====================
  async create(dto: CreateIndustryInnovationDto) {
    try {
      const innovation = await this.prisma.industryInnovation.create({
        data: dto,
      });
      this.logger.log(`✅ Innovation created: ${innovation.id}`);
      return innovation;
    } catch (error) {
      this.logger.error(`❌ Error creating innovation: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to create innovation section',
        error: error.message,
      });
    }
  }

  async findAll() {
    return this.prisma.industryInnovation.findMany({
      where: { isDeleted: false },
      include: {
        keys: {
          where: { isDeleted: false },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const innovation = await this.prisma.industryInnovation.findUnique({
      where: { id },
      include: {
        keys: {
          where: { isDeleted: false },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!innovation) {
      throw new NotFoundException(`IndustryInnovation #${id} not found`);
    }
    return innovation;
  }

  async update(id: string, dto: UpdateIndustryInnovationDto) {
    await this.findOne(id); // existence check
    try {
      const updated = await this.prisma.industryInnovation.update({
        where: { id },
        data: dto,
      });
      this.logger.log(`✅ Innovation updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`❌ Error updating innovation: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to update innovation section',
        error: error.message,
      });
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.industryInnovation.update({
      where: { id },
      data: { isDeleted: true },
    });
    this.logger.log(`🗑️ Innovation soft-deleted: ${id}`);
    return deleted;
  }

  // ===================== KEYS (Sub-resource) =====================
  async createKey(innovationId: string, dto: CreateIndustryInnovationKeyDto) {
    await this.findOne(innovationId); // parent must exist
    try {
      const key = await this.prisma.industryInnovationKey.create({
        data: { ...dto, innovationId },
      });
      this.logger.log(`✅ Key created: ${key.id} for innovation ${innovationId}`);
      return key;
    } catch (error) {
      this.logger.error(`❌ Error creating key: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to create key point',
        error: error.message,
      });
    }
  }

  async findAllKeys(innovationId: string) {
    await this.findOne(innovationId);
    return this.prisma.industryInnovationKey.findMany({
      where: { innovationId, isDeleted: false },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOneKey(id: string) {
    const key = await this.prisma.industryInnovationKey.findUnique({
      where: { id },
    });
    if (!key) throw new NotFoundException(`Key #${id} not found`);
    return key;
  }

  async updateKey(id: string, dto: UpdateIndustryInnovationKeyDto) {
    await this.findOneKey(id);
    try {
      const updated = await this.prisma.industryInnovationKey.update({
        where: { id },
        data: dto,
      });
      this.logger.log(`✅ Key updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`❌ Error updating key: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to update key point',
        error: error.message,
      });
    }
  }

  async removeKey(id: string) {
    await this.findOneKey(id);
    const deleted = await this.prisma.industryInnovationKey.update({
      where: { id },
      data: { isDeleted: true },
    });
    this.logger.log(`🗑️ Key soft-deleted: ${id}`);
    return deleted;
  }
}