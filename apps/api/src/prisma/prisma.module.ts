import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// Global agar modul fitur tidak perlu mengimpor ulang di setiap tempat.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
