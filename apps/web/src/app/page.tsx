import { ContextHeader } from '@/components/ruang-proyek/context-header';
import { ReadinessIndicator } from '@/components/ruang-proyek/readiness-indicator';
import { StageSummaryCards } from '@/components/ruang-proyek/stage-summary-cards';
import { StageTabs } from '@/components/ruang-proyek/stage-tabs';
import { PendingSection } from '@/components/ui/pending-section';

export const metadata = {
  title: 'Ruang Proyek — Rilis Tanpa Lupa',
};

/**
 * Ruang Proyek — layar utama aplikasi.
 *
 * Bagian yang belum dikerjakan ditandai PendingSection beserta task
 * penggantinya, supaya terlihat mana yang sudah jadi dan mana yang belum.
 * Setiap penanda dihapus saat task-nya selesai.
 */
export default function RuangProyekPage() {
  return (
    <div className="flex flex-col gap-6">
      <ContextHeader />

      <StageSummaryCards />

      <ReadinessIndicator />

      <StageTabs
        panels={{
          plan: (
            <PendingSection
              title="Isi tahap Plan"
              description="Dokumen PRD, tautan desain, mind map sprint, dan catatan rencana."
              taskKey="F01-T05"
              issue={8}
            />
          ),
          dev: (
            <PendingSection
              title="Isi tahap Dev"
              description="Ringkasan papan tugas beserta cabang fitur dan tugasnya."
              taskKey="F01-T05"
              issue={8}
            />
          ),
          release: (
            <PendingSection
              title="Isi tahap Release"
              description="Checklist kelengkapan dan dokumen rilis."
              taskKey="F07-T04"
              issue={94}
            />
          ),
        }}
      />

      <PendingSection
        title="Daftar Kekurangan Rilis"
        description="Butir yang belum lengkap, masing-masing bisa diklik menuju bagian yang harus dilengkapi."
        taskKey="F01-T06"
        issue={9}
      />
    </div>
  );
}
