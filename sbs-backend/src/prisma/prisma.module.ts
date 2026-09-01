// File Location: src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Is decorater se yeh module poore project me globally available ho jata hai
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export karna zaroori hai taaki doosre services iska use kar sakein
})
export class PrismaModule {}