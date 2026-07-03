import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Public } from '../auth/decorators/public.decorator';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  // ---- Public ----

  @Public()
  @Get('public')
  findActive() {
    return this.clients.findActive();
  }

  @Public()
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.clients.findBySlug(slug);
  }

  // ---- Admin ----

  @Get()
  findAll() {
    return this.clients.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clients.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  @Put(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.clients.toggleActive(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clients.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clients.remove(id);
  }
}
