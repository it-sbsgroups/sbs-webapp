// FILE: src/cloudinary/cloudinary.module.ts  (FULL REPLACEMENT)
import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [ApiKeysModule],   // replaces ConfigModule — ApiKeysService handles all fallbacks
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
