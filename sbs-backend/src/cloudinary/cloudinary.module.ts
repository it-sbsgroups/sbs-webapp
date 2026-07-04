import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [ApiKeysModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
