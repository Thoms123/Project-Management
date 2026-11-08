import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Prisma 7 tidak lagi memuat .env sendiri, dan .env kita ada di akar monorepo
// supaya satu berkas melayani frontend sekaligus backend.
loadEnv({ path: ['../../.env', '.env'], quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // Dipakai HANYA oleh perintah CLI (migrate, studio, db push). Saat runtime,
  // koneksi dibuat lewat driver adapter di src/prisma/prisma.service.ts.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
