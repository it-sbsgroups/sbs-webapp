// src/subscribers/dto/subscriber-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * SUBSCRIBER RESPONSE DTO
 * 
 * Defines the shape of data returned to the client
 * Separating response DTOs from input DTOs is important because:
 * 1. Response might include fields that input doesn't (id, timestamps)
 * 2. Response might EXCLUDE sensitive fields (passwords, internal notes)
 * 3. Response format might differ from input format
 */
export class SubscriberResponseDto {
  
  @ApiProperty({
    description: 'Unique subscriber ID',
    example: 'cl2v3xqk90000ymmx2v3xqk9',  // CUID format
  })
  id: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'Rahul',
  })
  firstName: string | null;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Kumar',
  })
  middleName: string | null;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Sharma',
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Email address',
    example: 'rahul.sharma@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Mobile number',
    example: '+919876543210',
  })
  mobile: string | null;

  @ApiPropertyOptional({
    description: 'WhatsApp number',
    example: '+919876543210',
  })
  whatsapp: string | null;

  @ApiProperty({
    description: 'Subscription status',
    example: true,
  })
  subscribed: boolean;

  @ApiPropertyOptional({
    description: 'When user unsubscribed (null if still subscribed)',
    example: null,
  })
  unsubscribedAt: Date | null;

  @ApiProperty({
    description: 'Record creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

/**
 * PAGINATED RESPONSE DTO
 * 
 * Wraps array of subscribers with pagination metadata
 */
export class PaginatedSubscriberResponseDto {
  
  @ApiProperty({
    description: 'Array of subscribers',
    type: [SubscriberResponseDto],  // Tells Swagger it's an array
  })
  data: SubscriberResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: PaginationMetaDto;
}

/**
 * PAGINATION METADATA DTO
 * 
 * Provides information about the current page and total results
 */
export class PaginationMetaDto {
  
  @ApiProperty({
    description: 'Total number of records',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,  // 150 total / 10 per page = 15 pages
  })
  totalPages: number;

  @ApiProperty({
    description: 'Number of active subscribers',
    example: 120,
  })
  subscribedCount: number;

  @ApiProperty({
    description: 'Number of unsubscribed users',
    example: 30,
  })
  unsubscribedCount: number;
}