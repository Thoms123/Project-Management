import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Satu koneksi Prisma yang dipakai bersama seluruh modul.
 *
 * Prisma 7 mewajibkan driver adapter: URL tidak lagi dibaca dari
 * schema.prisma, melainkan diserahkan ke adapter saat client dibuat.
 *
 * Nest menutup modul saat aplikasi berhenti, jadi koneksi dilepas lewat
 * OnModuleDestroy agar proses tidak menggantung menahan pool database.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL belum diset. Salin .env.example ke .env lalu isi nilainya.');
    }

    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Terhubung ke database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
