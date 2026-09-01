import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import {
  AskFaqDto,
  AnswerFaqDto,
  CreateAdminFaqDto,
  QueryFaqDto,
} from './dto/faq.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Public()
@Controller('faqs')
export class FaqPublicController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  getPublicFaqs(@Query() query: QueryFaqDto) {
    return this.faqService.getPublicFaqs(query);
  }

  @Get('featured')
  getFeaturedFaqs() {
    return this.faqService.getFeaturedFaqs();
  }

  @Post('ask')
  @HttpCode(HttpStatus.CREATED)
  submitQuestion(@Body() dto: AskFaqDto) {
    return this.faqService.submitQuestion(dto);
  }
}

@Controller('admin/faqs')
export class FaqAdminController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER', 'IT')
  adminGetAll(@Query() query: QueryFaqDto) {
    return this.faqService.adminGetAll(query);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER', 'IT')
  adminCreate(@Body() dto: CreateAdminFaqDto) {
    return this.faqService.adminCreate(dto);
  }

  @Patch(':id/respond')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER', 'IT')
  respondToQuestion(
    @Param('id') id: string,
    @Body() dto: AnswerFaqDto,
  ) {
    return this.faqService.respondToQuestion(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'FOUNDER', 'COFOUNDER', 'IT')
  softDelete(@Param('id') id: string) {
    return this.faqService.softDelete(id);
  }
}