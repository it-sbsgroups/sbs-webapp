// FILE: src/api-keys/api-keys.module.ts
// PrismaModule is @Global() so PrismaService is available without importing it here.
// No SiteConfigModule import — that would create a circular dependency.
import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Module({
  providers: [ApiKeysService],
  exports:   [ApiKeysService],
})
export class ApiKeysModule {}
