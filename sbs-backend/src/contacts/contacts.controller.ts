import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { AdminContactsQueryDto } from './dto/admin-contacts-query.dto';
import { Contact } from './entities/contact.entity';
import { ContactResponse } from './entities/contact-response.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // 1. ADMIN LISTING (must be before :id)
  @Get('admin')
  @ApiOperation({ summary: 'Admin panel: paginated, searchable contact list' })
  async findAllAdmin(@Query() query: AdminContactsQueryDto) {
    return this.contactsService.findAllAdmin(query);
  }

  // 2. PUBLIC SUBMISSION
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a new contact form' })
  @ApiResponse({ status: 201, type: Contact })
  create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(dto);
  }

  // 3. GET ALL (basic – not admin)
  @Get()
  @ApiOperation({ summary: 'Get all active contacts (basic)' })
  @ApiResponse({ status: 200, type: [Contact] })
  findAll(): Promise<Contact[]> {
    return this.contactsService.findAll();
  }

  // 4. GET SINGLE (must be after 'admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID (includes response history)' })
  @ApiResponse({ status: 200, type: Contact })
  findOne(@Param('id') id: string): Promise<Contact> {
    return this.contactsService.findOne(id);
  }

  // 5. UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Update contact (admin)' })
  @ApiResponse({ status: 200, type: Contact })
  update(@Param('id') id: string, @Body() dto: UpdateContactDto): Promise<Contact> {
    return this.contactsService.update(id, dto);
  }

  // 6. SOFT DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a contact' })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.contactsService.softDelete(id);
  }

  // 7. MANUAL REPLY
  @Post(':id/reply')
  @ApiOperation({ summary: 'Send a manual reply and record it' })
  @ApiResponse({ status: 201, type: ContactResponse })
  reply(@Param('id') id: string, @Body() dto: CreateReplyDto): Promise<ContactResponse> {
    return this.contactsService.reply(id, dto);
  }
}