import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface HealthReport {
  status: 'ok' | 'degraded';
  database: 'ok' | 'unreachable';
  uptimeSeconds: number;
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthReport> {
    let database: HealthReport['database'] = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // Database mati bukan alasan endpoint ini ikut gagal — justru itu yang
      // ingin dilaporkan, jadi statusnya diturunkan, bukan dilempar.
      database = 'unreachable';
    }

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      database,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
