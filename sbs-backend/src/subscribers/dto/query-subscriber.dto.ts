// src/subscribers/dto/query-subscriber.dto.ts

import {
  IsOptional,   // Query parameters are always optional
  IsBoolean,    // For subscribed filter
  IsString,     // For search term
  IsInt,        // For page and limit numbers
  Min,          // Minimum value for page/limit
  Max,          // Maximum value for limit
} from 'class-validator';

import { Type } from 'class-transformer';
// Type decorator is CRUCIAL for query parameters
// WHY? All query parameters arrive as STRINGS from HTTP
// Example: GET /subscribers?page=1&limit=10
// page is string "1", NOT number 1
// @Type(() => Number) converts "1" → 1

import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * QUERY SUBSCRIBER DTO
 * 
 * Handles ALL query parameters for the GET /subscribers endpoint
 * 
 * Example URL: GET /subscribers?page=1&limit=10&subscribed=true&search=rahul&sortBy=createdAt&sortOrder=desc
 * 
 * Each ? parameter becomes a property of this DTO
 */
export class QuerySubscriberDto {
  
  /**
   * PAGE NUMBER - For pagination
   * Controls which page of results to return
   */
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,     // Default value shown in Swagger
    minimum: 1,     // Minimum value shown in Swagger
  })
  
  @IsOptional()
  @Type(() => Number)  // CRUCIAL: Converts string "1" to number 1
  @IsInt({ message: 'Page must be a whole number' })
  @Min(1, { message: 'Page number must be at least 1' })
  // Why Min(1)? Because page 0 or negative pages don't make sense
  page?: number = 1;  // Default to page 1 if not provided
  // The = 1 ensures page is never undefined (important for calculations)


  /**
   * LIMIT - Items per page
   * Controls how many results appear on each page
   */
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,    // Prevents excessive data requests
  })
  
  @IsOptional()
  @Type(() => Number)  // Convert string to number
  @IsInt({ message: 'Limit must be a whole number' })
  @Min(1, { message: 'Minimum 1 item per page' })
  @Max(100, { message: 'Maximum 100 items per page' })
  // Why Max(100)? Prevents someone requesting 1000000 items
  // which could crash your server (Denial of Service protection)
  limit?: number = 10;  // Default to 10 items per page


  /**
   * SUBSCRIBED FILTER
   * Filter by subscription status
   */
  @ApiPropertyOptional({
    description: 'Filter by subscription status',
    example: true,
    enum: [true, false],  // Shows as dropdown in Swagger
  })
  
  @IsOptional()
  @Type(() => Boolean)  // Convert string "true" to boolean true
  @IsBoolean({ message: 'Subscribed filter must be true or false' })
  subscribed?: boolean;
  // true = show only subscribed users
  // false = show only unsubscribed users
  // undefined (not provided) = show all users


  /**
   * SEARCH - Text search
   * Searches in name and email fields
   */
  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'rahul',
  })
  
  @IsOptional()
  @IsString({ message: 'Search term must be text' })
  search?: string;
  // This will be used in a database query:
  // WHERE name LIKE '%rahul%' OR email LIKE '%rahul%'


  /**
   * SORT BY - Field to sort by
   * Controls which column is used for sorting
   */
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName'],
    // Shows allowed values in Swagger
  })
  
  @IsOptional()
  @IsString({ message: 'Sort field must be text' })
  sortBy?: string = 'createdAt';
  // Default: Sort by creation date (newest/oldest first based on sortOrder)


  /**
   * SORT ORDER - Ascending or Descending
   * Controls the direction of sorting
   */
  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    example: 'desc',
    default: 'desc',
    enum: ['asc', 'desc'],  // Only these two values allowed
  })
  
  @IsOptional()
  @IsString({ message: 'Sort order must be text' })
  sortOrder?: 'asc' | 'desc' = 'desc';
  // TypeScript union type: only 'asc' or 'desc' allowed
  // 'asc' = oldest first (ascending)
  // 'desc' = newest first (descending) - DEFAULT
  // Default desc because users usually want to see newest first
}