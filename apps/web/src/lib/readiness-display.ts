import type { ReadinessSummary } from '@rtl/shared';

/**
 * Tiga keadaan kesiapan rilis.
 *
 * `belum_diperiksa` sengaja dipisah dari `siap`: proyek tanpa satu butir pun
 * yang diperiksa belum tentu siap dirilis — yang benar adalah belum ada
 * apa-apa untuk dinilai. Menyatukan keduanya akan menampilkan "siap dirilis"
 * pada proyek yang bahkan belum diisi.
 */
export type ReadinessState = 'siap' | 'ada_kekurangan' | 'belum_diperiksa';

export function statusKesiapan(summary: ReadinessSummary): ReadinessState {
  if (summary.totalItems === 0) return 'belum_diperiksa';
  if (summary.incompleteItems > 0) return 'ada_kekurangan';
  return 'siap';
}

export interface ReadinessWording {
  title: string;
  description: string;
}

export function kalimatKesiapan(summary: ReadinessSummary): ReadinessWording {
  const { totalItems, incompleteItems } = summary;

  switch (statusKesiapan(summary)) {
    case 'siap':
      return {
        title: 'Siap dirilis',
        description: `Seluruh ${totalItems} butir kesiapan sudah lengkap.`,
      };

    case 'ada_kekurangan':
      return {
        title: `${incompleteItems} hal belum lengkap`,
        description: `${totalItems - incompleteItems} dari ${totalItems} butir kesiapan sudah beres.`,
      };

    case 'belum_diperiksa':
      return {
        title: 'Belum ada yang diperiksa',
        description: 'Isi rencana, tugas, env, dan dokumen rilis dulu agar kesiapannya bisa dinilai.',
      };
  }
}
