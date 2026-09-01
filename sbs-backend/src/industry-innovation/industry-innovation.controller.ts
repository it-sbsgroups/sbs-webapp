import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { IndustryInnovationService } from './industry-innovation.service';
import { CreateIndustryInnovationDto } from './dto/create-industry-innovation.dto';
import { UpdateIndustryInnovationDto } from './dto/update-industry-innovation.dto';
import { CreateIndustryInnovationKeyDto } from './dto/create-industry-innovation-key.dto';
import { UpdateIndustryInnovationKeyDto } from './dto/update-industry-innovation-key.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Industry Innovation')
@Controller('industry-innovation')
export class IndustryInnovationController {
  constructor(private readonly service: IndustryInnovationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new industry innovation section (Admin only)' })
  create(@Body() dto: CreateIndustryInnovationDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get('current')
  @ApiOperation({ summary: 'Get the current innovation section (public)' })
  findCurrent() {
    return this.service.findCurrent();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get one innovation section by ID (public)' })
  @ApiParam({ name: 'id', description: 'CUID', type: 'string' })
  findOne(@Param('id') id: string) {        // ✅ No ParseUUIDPipe
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an innovation section (Admin only)' })
  @ApiParam({ name: 'id', description: 'CUID', type: 'string' })
  update(
    @Param('id') id: string,                // ✅ No ParseUUIDPipe
    @Body() dto: UpdateIndustryInnovationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an innovation section (Admin only)' })
  @ApiParam({ name: 'id', description: 'CUID', type: 'string' })
  remove(@Param('id') id: string) {         // ✅ No ParseUUIDPipe
    return this.service.remove(id);
  }

  @Post(':innovationId/keys')
  @ApiOperation({ summary: 'Add a key point to a section (Admin only)' })
  @ApiParam({ name: 'innovationId', description: 'CUID', type: 'string' })
  createKey(
    @Param('innovationId') innovationId: string,  // ✅ No ParseUUIDPipe
    @Body() dto: CreateIndustryInnovationKeyDto,
  ) {
    return this.service.createKey(innovationId, dto);
  }

  @Public()
  @Get(':innovationId/keys')
  @ApiOperation({ summary: 'List all keys for a section (public)' })
  @ApiParam({ name: 'innovationId', description: 'CUID', type: 'string' })
  findAllKeys(@Param('innovationId') innovationId: string) { // ✅
    return this.service.findAllKeys(innovationId);
  }

  @Patch('keys/:id')
  @ApiOperation({ summary: 'Update a key point (Admin only)' })
  @ApiParam({ name: 'id', description: 'CUID', type: 'string' })
  updateKey(
    @Param('id') id: string,                // ✅ No ParseUUIDPipe
    @Body() dto: UpdateIndustryInnovationKeyDto,
  ) {
    return this.service.updateKey(id, dto);
  }

  @Delete('keys/:id')
  @ApiOperation({ summary: 'Soft-delete a key point (Admin only)' })
  @ApiParam({ name: 'id', description: 'CUID', type: 'string' })
  removeKey(@Param('id') id: string) {      // ✅ No ParseUUIDPipe
    return this.service.removeKey(id);
  }
}