import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCertificateDto, imageUrl: string) {
    return this.prisma.certificate.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.certificate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.certificate.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateCertificateDto, imageUrl?: string) {
    return this.prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        ...(imageUrl && { imageUrl }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.certificate.delete({ where: { id } });
  }
}