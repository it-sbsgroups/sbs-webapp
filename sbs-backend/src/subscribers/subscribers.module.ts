// src/subscribers/subscribers.module.ts

import { Module } from '@nestjs/common';
// Module decorator - The fundamental building block of NestJS applications
// Modules organize your application into logical units (features)
// Each module encapsulates related controllers, services, and providers
// Think of modules as "feature containers" - everything for subscribers lives here

import { SubscribersService } from './subscribers.service';
// Import our service that contains all the business logic
// Services handle data manipulation, business rules, and database interactions

import { SubscribersController } from './subscribers.controller';
// Import our controller that handles HTTP requests
// Controllers define routes and delegate work to services

// @Module DECORATOR
// This decorator provides metadata that NestJS uses to organize the application
// The module system enables:
// 1. Dependency Injection - Services can be injected where needed
// 2. Encapsulation - Keep related code together
// 3. Reusability - Modules can be imported by other modules
// 4. Lazy Loading - Modules can be loaded on-demand (performance)
@Module({
  // CONTROLLERS - Handle incoming HTTP requests
  // NestJS will instantiate these controllers automatically
  // Routes defined in these controllers become available
  // Example: @Controller('subscribers') creates routes at /subscribers/*
  controllers: [
    SubscribersController,
    // You can add more controllers here if needed
    // Example: SubscribersAdminController, SubscribersExportController
  ],

  // PROVIDERS - Classes that can be injected as dependencies
  // These are the "workers" that perform actual operations
  // By default, providers are SINGLETONS - one instance shared across the app
  // This means all requests use the same service instance (efficient)
  providers: [
    SubscribersService,
    // You can add more providers here:
    // Example: SubscribersValidationService, SubscribersEmailService
  ],

  // EXPORTS - Make providers available to OTHER modules
  // Only needed if another module needs to use SubscribersService
  // Example: If UserModule wants to check subscription status
  // Without exporting, the service is private to this module
  exports: [
    SubscribersService,
    // Now other modules that import SubscribersModule can inject SubscribersService
    // This enables cross-module functionality while maintaining encapsulation
  ],
})
export class SubscribersModule {}
// The module class itself is usually empty
// All configuration is in the @Module decorator metadata