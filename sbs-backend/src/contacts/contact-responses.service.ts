import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactResponseDto } from './dto/create-contact-response.dto';
import { UpdateContactResponseDto } from './dto/update-contact-response.dto';
import { ContactResponse } from './entities/contact-response.entity';

@Injectable()
export class ContactResponsesService {
  constructor(private prisma: PrismaService) {}

  async create(contactId: string, dto: CreateContactResponseDto): Promise<ContactResponse> {
    await this.prisma.contact.findFirstOrThrow({
      where: { id: contactId, deletedAt: null },
    });
    return this.prisma.contactResponse.create({
      data: {
        contactId,
        ...dto,
        sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : undefined,
      },
    });
  }

  async findAllByContact(contactId: string): Promise<ContactResponse[]> {
    await this.prisma.contact.findFirstOrThrow({
      where: { id: contactId, deletedAt: null },
    });
    return this.prisma.contactResponse.findMany({
      where: { contactId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async findOne(contactId: string, responseId: string): Promise<ContactResponse> {
    const response = await this.prisma.contactResponse.findFirst({
      where: { id: responseId, contactId },
    });
    if (!response) throw new NotFoundException(`Response #${responseId} not found`);
    return response;
  }

  async update(contactId: string, responseId: string, dto: UpdateContactResponseDto): Promise<ContactResponse> {
    await this.findOne(contactId, responseId);
    return this.prisma.contactResponse.update({
      where: { id: responseId },
      data: {
        ...dto,
        sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : undefined,
      },
    });
  }

  async remove(contactId: string, responseId: string): Promise<ContactResponse> {
    await this.findOne(contactId, responseId);
    return this.prisma.contactResponse.delete({ where: { id: responseId } });
  }
}