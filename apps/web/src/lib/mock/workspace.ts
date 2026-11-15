import type { Company, Project, Sprint } from '@rtl/shared';

/**
 * Data tiruan konteks workspace: perusahaan, proyek, dan sprint aktif.
 *
 * SEMENTARA. Diganti oleh endpoint `GET /projects/:id/overview` pada [F01-T15],
 * dan pemilihannya jadi dinamis lewat [F01-T07]–[F01-T09]. Dipisah ke modul
 * sendiri supaya penggantian itu cukup menyentuh satu berkas.
 */

export interface WorkspaceContext {
  company: Pick<Company, 'id' | 'name'>;
  project: Pick<Project, 'id' | 'name' | 'description'>;
  sprint: Sprint;
}

export const mockWorkspace: WorkspaceContext = {
  company: {
    id: 'c-1',
    name: 'PT Teknologi Nusantara',
  },
  project: {
    id: 'p-1',
    name: 'Payment Gateway V2',
    description: 'Integrasi pembayaran lintas bank untuk kanal merchant.',
  },
  sprint: {
    id: 's-12',
    projectId: 'p-1',
    sprintNumber: 12,
    startDate: '2026-11-03',
    endDate: '2026-11-21',
    releaseTarget: '2026-11-24',
    status: 'aktif',
  },
};
