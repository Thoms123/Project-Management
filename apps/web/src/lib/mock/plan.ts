import type { ProjectPlan } from '@rtl/shared';

/**
 * Rencana proyek untuk panel tahap Plan.
 *
 * SEMENTARA. Diganti oleh endpoint konten tahap pada [F01-T18]; pengisiannya
 * sendiri adalah fitur Rencana Proyek [F03].
 *
 * `designLink` sengaja null agar keadaan kosong ikut terlihat selama
 * pengembangan, dan agar cocok dengan angka "3 dari 4" pada kartu ringkasan.
 */
export const mockProjectPlan: ProjectPlan = {
  id: 'pl-1',
  projectId: 'p-1',
  prdLink: 'https://docs.internal/payment-gateway-v2/prd',
  prdFileUrl: null,
  designLink: null,
  notes:
    'Fase pertama fokus ke kanal merchant. Integrasi bank daerah menyusul '
    + 'setelah sertifikasi keamanan selesai.',
  createdAt: '2026-11-03T02:00:00.000Z',
};
