// src/subscribers/dto/update-subscriber.dto.ts

import { PartialType } from '@nestjs/mapped-types';
// PartialType is a NestJS utility that makes ALL properties of a class OPTIONAL
// It's perfect for PATCH endpoints where users update only some fields
// Example: CreateSubscriberDto requires email
//          UpdateSubscriberDto makes email optional (you might only update name)

import { CreateSubscriberDto } from './create-subscriber.dto';
// Import our base DTO to extend from it

import {
  IsBoolean,   // Validates true/false values
  IsOptional,  // Makes fields optional (already done by PartialType, but explicit is clearer)
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UPDATE SUBSCRIBER DTO
 * 
 * Extends CreateSubscriberDto but makes EVERYTHING optional
 * 
 * Why? Because PATCH requests only include the fields that need updating
 * 
 * Example usage:
 * - Update only name:    { firstName: "NewName" }
 * - Update only mobile:  { mobile: "+919999999999" }
 * - Unsubscribe user:    { subscribed: false }
 * 
 * With PartialType, all inherited fields become optional:
 * - email?: string        (was required in CreateSubscriberDto)
 * - firstName?: string    (was optional, still optional)
 * - mobile?: string       (was optional, still optional)
 */
export class UpdateSubscriberDto extends PartialType(CreateSubscriberDto) {
  // PartialType automatically makes all fields from CreateSubscriberDto optional
  // So we automatically get:
  // email?: string          (now optional! Can update without providing email)
  // firstName?: string
  // middleName?: string
  // lastName?: string
  // mobile?: string
  // whatsapp?: string

  /**
   * SUBSCRIPTION STATUS
   * 
   * This field is ONLY in the Update DTO, not in Create DTO
   * Why? Because:
   * - New subscribers are ALWAYS subscribed (no need to specify)
   * - Only when UPDATING might you want to change subscription status
   * - Keeps Create DTO clean and focused on new subscriptions
   */
  @ApiPropertyOptional({
    description: 'Subscription status (true = subscribe, false = unsubscribe)',
    example: false,
    // Shows example of unsubscribing a user
  })
  
  @IsOptional()
  // Makes this field optional in updates
  // If not provided, subscription status stays as-is
  
  @IsBoolean({
    message: 'Subscription status must be true or false',
  })
  // Ensures the value is a real boolean (true/false)
  // NOT a string "true" or number 1
  // This prevents type confusion in your business logic
  
  subscribed?: boolean;
  // The ? makes it optional in TypeScript
  // If true → subscribe (or re-subscribe)
  // If false → unsubscribe
  // If not provided → no change to subscription status
}