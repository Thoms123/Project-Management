import type { StageSummary } from '@rtl/shared';

/**
 * Ringkasan tiga tahap proyek dalam bentuk angka.
 *
 * SEMENTARA. Diganti oleh endpoint `GET /projects/:id/overview` pada [F01-T15];
 * agregasinya dihitung di [F01-T14].
 *
 * Butir Plan yang belum terisi adalah tautan desain — itulah yang tampil
 * sebagai keadaan kosong di panel tahap Plan, sehingga angka 3 dari 4 pada
 * kartu dan isi panelnya bercerita hal yang sama.
 *
 * Tahap Release sengaja dibiarkan kosong (`total: 0`) karena memang begitu
 * keadaan proyek yang belum menyiapkan dokumen rilis — sekaligus membuat
 * keadaan kosong ikut terlihat selama pengembangan, bukan jalur yang tidak
 * pernah dicoba sampai muncul di produksi.
 */
export const mockStageSummaries: StageSummary[] = [
  {
    stage: 'plan',
    completed: 3,
    total: 4,
    details: [
      { label: 'Dokumen PRD', value: 1 },
      { label: 'Mind map sprint', value: 1 },
      { label: 'Catatan rencana', value: 1 },
    ],
  },
  {
    stage: 'dev',
    completed: 5,
    total: 8,
    details: [
      { label: 'Belum mulai', value: 1 },
      { label: 'Dikerjakan', value: 2 },
      { label: 'Selesai', value: 5 },
    ],
  },
  {
    stage: 'release',
    completed: 0,
    total: 0,
    details: [],
  },
];
