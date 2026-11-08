import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('HealthService', () => {
  async function buildService(queryRaw: () => Promise<unknown>) {
    const moduleRef = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: { $queryRaw: queryRaw } }],
    }).compile();

    return moduleRef.get(HealthService);
  }

  it('melaporkan ok saat database bisa dihubungi', async () => {
    const service = await buildService(vi.fn().mockResolvedValue([{ '?column?': 1 }]));

    const report = await service.check();

    expect(report.status).toBe('ok');
    expect(report.database).toBe('ok');
  });

  it('melaporkan degraded, bukan melempar, saat database mati', async () => {
    const service = await buildService(vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const report = await service.check();

    expect(report.status).toBe('degraded');
    expect(report.database).toBe('unreachable');
  });
});
