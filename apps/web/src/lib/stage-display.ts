import type { ProjectStage, StageSummary } from '@rtl/shared';

/**
 * Kata-kata per tahap.
 *
 * Ditaruh di frontend, bukan dikirim backend, supaya kalimatnya bisa
 * menyesuaikan tampilan tanpa mengubah kontrak API.
 */
interface StageWording {
  title: string;
  /** Satuan yang dihitung, mis. "tugas". */
  unit: string;
  /** Kata kerja penutup, mis. "selesai" pada "5 dari 8 tugas selesai". */
  verb: string;
  /** Keterangan saat tahap belum diisi sama sekali. */
  emptyHint: string;
}

export const STAGE_WORDING: Record<ProjectStage, StageWording> = {
  plan: {
    title: 'Plan',
    unit: 'dokumen rencana',
    verb: 'terisi',
    emptyHint: 'Rencana belum diisi — mulai dari dokumen PRD dan tautan desain.',
  },
  dev: {
    title: 'Dev',
    unit: 'tugas',
    verb: 'selesai',
    emptyHint: 'Belum ada tugas di sprint ini.',
  },
  release: {
    title: 'Release',
    unit: 'dokumen rilis',
    verb: 'lengkap',
    emptyHint: 'Dokumen rilis belum ada — mis. SDD atau hasil pentest.',
  },
};

/** Tahap tanpa satu butir pun yang diperhitungkan berarti belum diisi. */
export function tahapKosong(stage: StageSummary): boolean {
  return stage.total === 0;
}

/**
 * Kalimat ringkas untuk kartu tahap, mis. "5 dari 8 tugas selesai".
 *
 * Mengembalikan keterangan kosong bila tahap belum diisi, bukan "0 dari 0",
 * yang membingungkan dan tidak memberi tahu apa yang harus dilakukan.
 */
export function ringkasTahap(stage: StageSummary): string {
  const kata = STAGE_WORDING[stage.stage];
  if (tahapKosong(stage)) return kata.emptyHint;

  return `${stage.completed} dari ${stage.total} ${kata.unit} ${kata.verb}`;
}

/** Persentase kelengkapan, dibulatkan. Nol bila tahap belum diisi. */
export function persenTahap(stage: StageSummary): number {
  if (tahapKosong(stage)) return 0;
  return Math.round((stage.completed / stage.total) * 100);
}
