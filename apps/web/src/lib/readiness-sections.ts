import type { ProjectStage, ReadinessItem } from '@rtl/shared';

type Section = ReadinessItem['section'];

/**
 * Ke mana sebuah butir kesiapan membawa pengguna.
 *
 * `stage` berarti butir itu bisa dibuka sekarang — cukup berpindah tab di
 * halaman ini. `pendingFeature` berarti tujuannya belum dibangun; butir
 * seperti itu tidak dijadikan tombol, karena tombol yang tidak membawa ke
 * mana-mana lebih membingungkan daripada tidak ada tombol sama sekali.
 */
type SectionTarget =
  | { kind: 'stage'; stage: ProjectStage; label: string }
  | { kind: 'pendingFeature'; label: string; pendingIn: string };

export const SECTION_TARGET: Record<Section, SectionTarget> = {
  rencana: { kind: 'stage', stage: 'plan', label: 'Rencana' },
  tugas: { kind: 'stage', stage: 'dev', label: 'Tugas' },
  env: { kind: 'pendingFeature', label: 'Variabel env', pendingIn: 'Daftar Rahasia' },
  database: { kind: 'pendingFeature', label: 'Catatan database', pendingIn: 'Daftar Rahasia' },
  dokumen: { kind: 'pendingFeature', label: 'Dokumen rilis', pendingIn: 'Dokumen & Rilis' },
};

/** Butir yang belum lengkap saja, karena itulah yang perlu dibereskan. */
export function butirBelumLengkap(items: ReadinessItem[]): ReadinessItem[] {
  return items.filter((item) => !item.isComplete);
}
