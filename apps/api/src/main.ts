import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      // Buang properti yang tidak dideklarasikan di DTO, dan tolak permintaan
      // yang mengirimnya — mencegah field tak terduga menyelinap ke database.
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Asal yang diizinkan adalah alamat FRONTEND, bukan alamat API ini sendiri.
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);

  new Logger('Bootstrap').log(`API berjalan di http://localhost:${port}/api`);
}

void bootstrap();
