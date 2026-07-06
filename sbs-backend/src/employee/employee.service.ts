import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto, SortOrder } from './dto/query-employee.dto';
import { Employee } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// Fields the client must never be able to set/overwrite via update.
const IMMUTABLE_FIELDS = ['id', 'createdAt', 'updatedAt'] as const;

// Whitelist of columns that are allowed to be sorted on (prevents
// "Unknown argument" Prisma errors / injection via sortBy).
const SORTABLE = new Set([
  'name', 'email', 'mobile', 'createdAt',
  'updatedAt', 'role', 'designation', 'department',
]);

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // strip immutable fields if a client accidentally sends them
    const data: any = { ...createEmployeeDto };
    for (const f of IMMUTABLE_FIELDS) delete data[f];

    try {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new ConflictException({
          message: 'Employee with this email already exists',
          error: 'Duplicate Email',
        });
      }

      const employee = await this.prisma.employee.create({ data });
      this.logger.log(`✅ Employee created: ${employee.id}`);
      return employee;
    } catch (error) {
      // Clean up the just-uploaded Cloudinary image so it doesn't orphan
      if (data.image) {
        this.cloudinary.deleteImageByUrl(data.image).catch(() => undefined);
      }
      if (error instanceof ConflictException) throw error;
      this.logger.error(`❌ Error creating employee: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to create employee',
        error: error.message,
      });
    }
  }

  async findAll(queryDto: QueryEmployeeDto) {
    try {
      const {
        search, state, city, district, role, department, designation,
        isActive, page = 1, limit = 10,
        sortBy = 'createdAt', sortOrder = SortOrder.DESC,
      } = queryDto;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { mobile: { contains: search } },
          { designation: { contains: search } },
          { department: { contains: search } },
        ];
      }
      if (department) where.department = { contains: department };
      if (designation) where.designation = { contains: designation };
      if (isActive !== undefined) where.isActive = isActive;

      const skip = (page - 1) * limit;
      const safeSortBy = SORTABLE.has(sortBy) ? sortBy : 'createdAt';
      const orderBy: any = { [safeSortBy]: sortOrder };

      const [employees, total] = await Promise.all([
        this.prisma.employee.findMany({ where, orderBy, skip, take: limit }),
        this.prisma.employee.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: employees,
        meta: {
          total, page, limit, totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching employees: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to fetch employees',
        error: error.message,
      });
    }
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const existing = await this.findOne(id); // throws 404 if missing

    const data: any = {};
    for (const [key, value] of Object.entries(updateEmployeeDto)) {
      if (IMMUTABLE_FIELDS.includes(key as any)) continue;
      if (value === undefined) continue;
      data[key] = value;
    }

    try {
      if (data.email && data.email !== existing.email) {
        const emailExists = await this.prisma.employee.findUnique({
          where: { email: data.email },
        });
        if (emailExists) {
          throw new ConflictException({
            message: 'Email already in use by another employee',
            error: 'Duplicate Email',
          });
        }
      }

      const updated = await this.prisma.employee.update({ where: { id }, data });

      // If the photo changed, delete the old Cloudinary asset.
      if (data.image && existing.image && data.image !== existing.image) {
        this.cloudinary.deleteImageByUrl(existing.image).catch(() => undefined);
      }

      this.logger.log(`✅ Employee updated: ${id}`);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      this.logger.error(`❌ Error updating employee: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to update employee',
        error: error.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.findOne(id);
    try {
      await this.prisma.employee.delete({ where: { id } });
      if (existing.image) {
        this.cloudinary.deleteImageByUrl(existing.image).catch(() => undefined);
      }
      this.logger.log(`✅ Employee deleted: ${id}`);
      return { message: 'Employee deleted successfully' };
    } catch (error) {
      this.logger.error(`❌ Error deleting employee: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to delete employee',
        error: error.message,
      });
    }
  }

  async bulkCreate(dtos: CreateEmployeeDto[]) {
    const success: Employee[] = [];
    const errors: { employee: CreateEmployeeDto; error: string }[] = [];
    for (const dto of dtos) {
      try {
        success.push(await this.create(dto));
      } catch (error) {
        errors.push({ employee: dto, error: error.message });
      }
    }
    return { success, errors };
  }

  async toggleActive(id: string): Promise<Employee> {
    const employee = await this.findOne(id);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { isActive: !employee.isActive },
    });
    this.logger.log(`✅ Toggled ${id} → active: ${updated.isActive}`);
    return updated;
  }

  async getStats() {
    try {
      const [total, active, inactive] = await Promise.all([
        this.prisma.employee.count(),
        this.prisma.employee.count({ where: { isActive: true } }),
        this.prisma.employee.count({ where: { isActive: false } }),
      ]);
      return {
        total, active, inactive
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching stats: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Failed to fetch employee statistics',
        error: error.message,
      });
    }
  }
}