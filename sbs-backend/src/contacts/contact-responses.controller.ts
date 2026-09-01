import {
  Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ContactResponsesService } from './contact-responses.service';
import { CreateContactResponseDto } from './dto/create-contact-response.dto';
import { UpdateContactResponseDto } from './dto/update-contact-response.dto';
import { ContactResponse } from './entities/contact-response.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('contact-responses')
@Controller('contacts/:contactId/responses')
export class ContactResponsesController {
  constructor(private readonly service: ContactResponsesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a response manually (no email sent)' })
  @ApiResponse({ status: 201, type: ContactResponse })
  create(@Param('contactId') contactId: string, @Body() dto: CreateContactResponseDto) {
    return this.service.create(contactId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all responses for a contact' })
  @ApiResponse({ status: 200, type: [ContactResponse] })
  findAll(@Param('contactId') contactId: string) {
    return this.service.findAllByContact(contactId);
  }

  @Get(':responseId')
  @ApiOperation({ summary: 'Get a single response' })
  @ApiResponse({ status: 200, type: ContactResponse })
  findOne(@Param('contactId') contactId: string, @Param('responseId') responseId: string) {
    return this.service.findOne(contactId, responseId);
  }

  @Patch(':responseId')
  @ApiOperation({ summary: 'Update a response' })
  @ApiResponse({ status: 200, type: ContactResponse })
  update(
    @Param('contactId') contactId: string,
    @Param('responseId') responseId: string,
    @Body() dto: UpdateContactResponseDto,
  ) {
    return this.service.update(contactId, responseId, dto);
  }

  @Delete(':responseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a response permanently' })
  async remove(@Param('contactId') contactId: string, @Param('responseId') responseId: string) {
    await this.service.remove(contactId, responseId);
  }
}