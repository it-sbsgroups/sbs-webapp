// src/subscribers/subscribers.controller.ts

import {
  Controller,      // You're missing this import!
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,   // For CUID validation (since you're using CUID)
} from '@nestjs/common';

import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(
    private readonly subscribersService: SubscribersService,
  ) {}

  @Public()
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Successfully subscribed' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  subscribe(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscribersService.subscribe(createSubscriberDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all subscribers' })
  @ApiResponse({ status: 200, description: 'List of subscribers' })
  findAll(@Query() query: QuerySubscriberDto) {
    return this.subscribersService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get subscriber by ID' })
  @ApiParam({ name: 'id', description: 'Subscriber ID (CUID)', type: String })
  @ApiResponse({ status: 200, description: 'Subscriber found' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get subscriber by email' })
  @ApiParam({ name: 'email', description: 'Subscriber email', type: String })
  @ApiResponse({ status: 200, description: 'Subscriber found' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  findByEmail(@Param('email') email: string) {
    return this.subscribersService.findByEmail(email);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update subscriber' })
  @ApiParam({ name: 'id', description: 'Subscriber ID (CUID)', type: String })
  @ApiResponse({ status: 200, description: 'Subscriber updated' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
  ) {
    return this.subscribersService.update(id, updateSubscriberDto);
  }

  @Public()
  @Post(':id/resubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-subscribe user' })
  @ApiParam({ name: 'id', description: 'Subscriber ID (CUID)', type: String })
  @ApiResponse({ status: 200, description: 'Successfully re-subscribed' })
  @ApiResponse({ status: 400, description: 'Already subscribed' })
  reSubscribe(@Param('id') id: string) {
    return this.subscribersService.reSubscribe(id);
  }

  @Public()
  @Post(':id/unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe user' })
  @ApiParam({ name: 'id', description: 'Subscriber ID (CUID)', type: String })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 400, description: 'Already unsubscribed' })
  unsubscribe(@Param('id') id: string) {
    return this.subscribersService.unsubscribe(id);
  }

  @Public()
  @Post('unsubscribe-by-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe by email' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  unsubscribeByEmail(@Body('email') email: string) {
    return this.subscribersService.unsubscribeByEmail(email);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subscriber' })
  @ApiParam({ name: 'id', description: 'Subscriber ID (CUID)', type: String })
  @ApiResponse({ status: 200, description: 'Subscriber deleted' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete subscribers' })
  @ApiResponse({ status: 200, description: 'Subscribers deleted' })
  removeMany(@Body('ids') ids: string[]) {
    return this.subscribersService.removeMany(ids);
  }

  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  getStatistics() {
    return this.subscribersService.getStatistics();
  }
}