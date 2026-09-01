import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [ApiKeysModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
