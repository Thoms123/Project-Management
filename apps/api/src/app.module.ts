import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // .env ada di akar monorepo, bukan di dalam apps/api, supaya satu berkas
      // melayani frontend dan backend sekaligus.
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
