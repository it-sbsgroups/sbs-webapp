import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('location')
export class LocationController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /location/states → all states for dropdown */
  @Get('states')
  async getStates() {
    return this.prisma.state.findMany({ orderBy: { name: 'asc' } });
  }

  @Get('cities')
  async getCities(@Query('stateId') stateId?: string) {
    return this.prisma.city.findMany({
      where: stateId ? { stateId: Number(stateId) } : undefined,
      orderBy: { name: 'asc' },
      include: { state: { select: { id: true, name: true } } },
    });
  }

  @Get('pincodes')
  async getPincodes(@Query('cityId') cityId?: string) {
    return this.prisma.pincode.findMany({
      where: cityId ? { cityId: Number(cityId) } : undefined,
      orderBy: { code: 'asc' },
    });
  }

  @Get('lookup')
  async lookup(@Query('pincode') pincode?: string, @Query('cityId') cityId?: string) {
    if (pincode) {
      const rows = await this.prisma.pincode.findMany({
        where: { code: pincode.trim() },
        include: { city: { include: { state: true } } },
      });
      return rows.map((r) => ({
        pincodeId: r.id,
        code:      r.code,
        cityId:    r.city.id,
        cityName:  r.city.name,
        stateId:   r.city.state.id,
        stateName: r.city.state.name,
      }));
    }
    if (cityId) {
      const city = await this.prisma.city.findUnique({
        where: { id: Number(cityId) },
        include: { state: true, pincodes: { orderBy: { code: 'asc' } } },
      });
      if (!city) return null;
      return {
        cityId:    city.id,
        cityName:  city.name,
        stateId:   city.state.id,
        stateName: city.state.name,
        pincodes:  city.pincodes.map((p) => ({ id: p.id, code: p.code })),
      };
    }
    return [];
  }
}