import type { ReadinessItem } from '@rtl/shared';

/**
 * Butir pemeriksaan kesiapan rilis.
 *
 * SEMENTARA. Diganti oleh endpoint daftar kekurangan rilis pada [F01-T19].
 *
 * Isinya sengaja cocok dengan data tiruan lain di halaman ini: tautan desain
 * yang kosong sama dengan panel Plan, satu tugas tanpa cabang dan dua tugas
 * yang masih dikerjakan sama dengan panel Dev, dan jumlahnya — 12 butir, 4
 * belum lengkap — sama dengan indikator kesiapan. Data contoh yang saling
 * bertentangan akan terbaca sebagai bug.
 */
export const mockReadinessItems: ReadinessItem[] = [
  { id: 'r-1', section: 'rencana', isComplete: true, label: 'Dokumen PRD tersimpan', hint: null },
  {
    id: 'r-2', section: 'rencana', isComplete: false,
    label: 'Tautan desain belum diisi',
    hint: 'Acuan tampilan belum ada, pengerjaan UI bisa meleset.',
  },
  { id: 'r-3', section: 'rencana', isComplete: true, label: 'Catatan rencana terisi', hint: null },

  {
    id: 'r-4', section: 'tugas', isComplete: false,
    label: '1 tugas belum mencatat cabang kerja',
    hint: 'Tanpa nama cabang, pekerjaannya sulit dilacak saat rilis.',
  },
  {
    id: 'r-5', section: 'tugas', isComplete: false,
    label: '2 tugas masih dikerjakan',
    hint: 'Sprint belum bisa ditutup selama masih ada yang berjalan.',
  },

  { id: 'r-6', section: 'env', isComplete: true, label: 'DATABASE_URL sudah disiapkan', hint: null },
  { id: 'r-7', section: 'env', isComplete: true, label: 'JWT_SECRET sudah disiapkan', hint: null },
  {
    id: 'r-8', section: 'env', isComplete: false,
    label: 'PAYMENT_API_KEY belum disiapkan',
    hint: 'Pembayaran akan gagal di production tanpa kunci ini.',
  },

  { id: 'r-9', section: 'database', isComplete: true, label: 'Migrasi terakhir sudah dijalankan', hint: null },
  { id: 'r-10', section: 'database', isComplete: true, label: 'Query laporan transaksi tercatat', hint: null },

  { id: 'r-11', section: 'dokumen', isComplete: true, label: 'Dokumen SDD tersedia', hint: null },
  { id: 'r-12', section: 'dokumen', isComplete: true, label: 'Hasil pentest tersedia', hint: null },
];
