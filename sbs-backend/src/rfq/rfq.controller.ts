import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Headers, UnauthorizedException,
} from '@nestjs/common';
import { RfqService } from './rfq.service';
import { RfqIntegrationsService } from './rfq-integrations.service';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('rfq')
export class RfqController {
  constructor(
    private readonly rfqService: RfqService,
    private readonly rfqIntegrations: RfqIntegrationsService,
    private readonly prisma: PrismaService
  ) {}

  // -------------------- Outbound integrations (external API + Google Sheet) --------------------
  @Get('integrations')
  getIntegrationSettings() {
    return this.rfqIntegrations.getSettings();
  }

  @Put('integrations')
  updateIntegrationSettings(@Body() data: any) {
    return this.rfqIntegrations.updateSettings(data);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.rfqService.findAll(query);
  }

  @Get('settings')
  getSettings() {
    return this.rfqService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() data: any) {
    return this.rfqService.updateSettings(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rfqService.findOne(id);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: any) {
    return this.rfqService.create(data);
  }

  @Post(':id/reply')
  reply(@Param('id') id: string, @Body() data: any) {
    return this.rfqService.reply(id, data);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.rfqService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.rfqService.remove(id);
  }

  @Get('api-keys/all')
  findAllApiKeys() {
    return this.rfqService.findAllApiKeys();
  }

  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  createApiKey(@Body() data: { name: string; permissions?: string[] }) {
    return this.rfqService.createApiKey(data);
  }

  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteApiKey(@Param('id') id: string) {
    return this.rfqService.deleteApiKey(id);
  }

  @Put('api-keys/:id/toggle')
  toggleApiKey(@Param('id') id: string) {
    return this.rfqService.toggleApiKey(id);
  }

  @Public()
  @Get('public/data')
  async getPublicRfqData(
    @Headers('x-api-key') apiKey: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException('API Key is required. Pass it as x-api-key header.');
    }

    // Verify API key
    const key = await this.prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (!key || !key.isActive) {
      throw new UnauthorizedException('Invalid or inactive API Key.');
    }

    // Check if IP is allowed
    // (IP check can be added here if needed)

    // Update last used and request count
    await this.prisma.apiKey.update({
      where: { id: key.id },
      data: {
        lastUsedAt: new Date(),
        requestCount: { increment: 1 },
      },
    });

    // Return READ-ONLY data
    const pg = Number(page) || 1;
    const ps = Number(pageSize) || 50;

    const [rfqs, total] = await Promise.all([
      this.prisma.rfqRequest.findMany({
        skip: (pg - 1) * ps,
        take: ps,
        where: {},
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  model: true,
                  category: { select: { name: true } },
                  brand: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rfqRequest.count(),
    ]);

    return {
      success: true,
      data: rfqs,
      meta: { total, page: pg, pageSize: ps, totalPages: Math.ceil(total / ps) },
      exportedAt: new Date().toISOString(),
      note: 'This is READ-ONLY data. No modifications can be made through this endpoint.',
    };
  }
}