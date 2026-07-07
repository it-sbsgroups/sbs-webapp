import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload & compress an employee photo to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB raw cap (gets compressed anyway)
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const result = await this.cloudinaryService.uploadEmployeeImage(file);
    return { url: result.url, bytes: result.bytes };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Employee with this email already exists' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple employees in bulk' })
  bulkCreate(@Body() createEmployeeDtos: CreateEmployeeDto[]) {
    return this.employeeService.bulkCreate(createEmployeeDtos);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all employees with filtering, sorting and pagination' })
  findAll(@Query() queryDto: QueryEmployeeDto) {
    return this.employeeService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get employee statistics' })
  getStats() {
    return this.employeeService.getStats();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee UUID', type: 'string' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee details' })
  @ApiParam({ name: 'id', description: 'Employee UUID', type: 'string' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle employee active/inactive status' })
  @ApiParam({ name: 'id', description: 'Employee UUID', type: 'string' })
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID', type: 'string' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }
}