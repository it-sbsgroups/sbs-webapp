import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Contact } from './entities/contact.entity';
import { ContactResponse } from './entities/contact-response.entity';
import { AdminContactsQueryDto } from './dto/admin-contacts-query.dto';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = await this.prisma.contact.create({ data: dto });

    // Fire auto-reply (don't wait for it)
    this.mailService.sendContactAutoReply(contact).catch(err =>
      console.error('Auto-reply failed:', err),
    );

    return contact;
  }

  async findAll(): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(query: AdminContactsQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      responded,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    if (responded !== undefined) {
      where.responded = responded === 'true';
    }

    // Define allowed sort fields (must match Prisma model fields)
    const allowedSortFields = ['createdAt', 'fullName', 'email', 'companyName'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { responses: true } },
          responses: {
            select: { sentAt: true },
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    const records = data.map((contact) => ({
      ...contact,
      responseCount: contact._count.responses,
      lastResponseAt: contact.responses[0]?.sentAt || null,
      responses: undefined,
      _count: undefined,
    }));

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.prisma.contact.findFirst({
      where: { id, deletedAt: null },
      include: { responses: { orderBy: { sentAt: 'desc' } } },
    });
    if (!contact) throw new NotFoundException(`Contact #${id} not found`);
    return contact;
  }

  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    await this.findOne(id);
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async softDelete(id: string): Promise<Contact> {
    await this.findOne(id);
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async remove(id: string): Promise<Contact> {
    await this.findOne(id);
    return this.prisma.contact.delete({ where: { id } });
  }

  // Manual admin reply – sends email and records it
  async reply(contactId: string, dto: CreateReplyDto): Promise<ContactResponse> {
    const contact = await this.findOne(contactId);
    return this.mailService.sendContactReplyAndRecord(
      contactId,
      contact.email,
      contact.fullName,
      { subject: dto.subject, emailBody: dto.emailBody },
    );
  }
}