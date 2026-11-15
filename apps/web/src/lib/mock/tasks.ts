import type { Task } from '@rtl/shared';

/**
 * Tugas sprint aktif untuk panel tahap Dev.
 *
 * SEMENTARA. Diganti oleh endpoint konten tahap pada [F01-T18]; papan tugas
 * yang sesungguhnya adalah fitur [F02].
 *
 * Sebarannya sengaja dibuat cocok dengan kartu ringkasan tahap Dev —
 * 1 belum mulai, 2 dikerjakan, 5 selesai — supaya kartu dan panel tidak
 * bercerita hal yang berbeda.
 */
const dasar = { projectId: 'p-1', sprintId: 's-12', planId: 'pl-1', description: null };

export const mockTasks: Task[] = [
  {
    ...dasar, id: 't-1', title: 'Validasi kartu kredit di gerbang pembayaran',
    status: 'selesai', priority: 'mendesak',
    featureBranch: 'feature/F02-gerbang-pembayaran', taskBranch: 'task/validasi-kartu',
    createdAt: '2026-11-03T03:00:00.000Z',
  },
  {
    ...dasar, id: 't-2', title: 'Simpan log transaksi ke tabel audit',
    status: 'selesai', priority: 'sedang',
    featureBranch: 'feature/F02-gerbang-pembayaran', taskBranch: 'task/log-audit',
    createdAt: '2026-11-03T03:10:00.000Z',
  },
  {
    ...dasar, id: 't-3', title: 'Tangani timeout dari bank penerbit',
    status: 'selesai', priority: 'mendesak',
    featureBranch: 'feature/F02-gerbang-pembayaran', taskBranch: 'task/timeout-bank',
    createdAt: '2026-11-03T03:20:00.000Z',
  },
  {
    ...dasar, id: 't-4', title: 'Buat halaman riwayat transaksi merchant',
    status: 'selesai', priority: 'sedang',
    featureBranch: 'feature/F02-riwayat-merchant', taskBranch: 'task/halaman-riwayat',
    createdAt: '2026-11-03T03:30:00.000Z',
  },
  {
    ...dasar, id: 't-5', title: 'Terapkan penyaringan riwayat per tanggal',
    status: 'selesai', priority: 'santai',
    featureBranch: 'feature/F02-riwayat-merchant', taskBranch: 'task/filter-tanggal',
    createdAt: '2026-11-03T03:40:00.000Z',
  },
  {
    ...dasar, id: 't-6', title: 'Sambungkan notifikasi pembayaran gagal',
    status: 'dikerjakan', priority: 'mendesak',
    featureBranch: 'feature/F02-notifikasi', taskBranch: 'task/notifikasi-gagal',
    createdAt: '2026-11-03T03:50:00.000Z',
  },
  {
    ...dasar, id: 't-7', title: 'Tulis uji integrasi alur pembayaran',
    status: 'dikerjakan', priority: 'sedang',
    featureBranch: 'feature/F02-gerbang-pembayaran', taskBranch: 'task/uji-integrasi',
    createdAt: '2026-11-03T04:00:00.000Z',
  },
  {
    ...dasar, id: 't-8', title: 'Siapkan dokumen SDD untuk rilis',
    status: 'belum_mulai', priority: 'santai',
    featureBranch: null, taskBranch: null,
    createdAt: '2026-11-03T04:10:00.000Z',
  },
];
