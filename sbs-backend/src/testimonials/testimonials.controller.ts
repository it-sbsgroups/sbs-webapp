import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  IssuePasscodeDto,
  SubmitTestimonialDto,
  UpdateTestimonialStatusDto,
} from './dto/testimonial.dto';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  // ---- Public ----

  @Public()
  @Get('public')
  findPublic() {
    return this.testimonials.findPublic();
  }

  @Public()
  @Get('verify/:code')
  verify(@Param('code') code: string) {
    return this.testimonials.verifyPasscode(code);
  }

  @Public()
  @Post('submit')
  submit(@Body() dto: SubmitTestimonialDto) {
    return this.testimonials.submit(dto);
  }

  // ---- Admin: passcodes (declare before ':id' routes) ----

  @Get('passcodes')
  listPasscodes() {
    return this.testimonials.listPasscodes();
  }

  @Post('passcodes')
  issuePasscode(@Body() dto: IssuePasscodeDto) {
    return this.testimonials.issuePasscode(dto);
  }

  @Delete('passcodes/:id')
  deletePasscode(@Param('id') id: string) {
    return this.testimonials.deletePasscode(id);
  }

  // ---- Admin: request a testimonial from an existing Client/Brand ----

  @Post('request/client/:clientId')
  requestForClient(@Param('clientId') clientId: string) {
    return this.testimonials.requestForClient(clientId);
  }

  @Post('request/brand/:brandId')
  requestForBrand(@Param('brandId') brandId: string) {
    return this.testimonials.requestForBrand(brandId);
  }

  // ---- Admin: manually add a standalone testimonial (no passcode flow) ----
  @Post('manual')
  createManual(
    @Body() dto: { name: string; companyName: string; testimony: string; designation?: string; email?: string },
  ) {
    return this.testimonials.createManual(dto);
  }

  // ---- Admin: moderation ----

  @Get()
  findAll(@Query('status') status?: string) {
    return this.testimonials.findAll(status);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialStatusDto,
  ) {
    return this.testimonials.updateStatus(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonials.remove(id);
  }
}
