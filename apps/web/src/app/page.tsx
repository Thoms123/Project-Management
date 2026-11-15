import { ContextHeader } from '@/components/ruang-proyek/context-header';
import { DevPanel } from '@/components/ruang-proyek/dev-panel';
import { PlanPanel } from '@/components/ruang-proyek/plan-panel';
import { ReadinessIndicator } from '@/components/ruang-proyek/readiness-indicator';
import { StageSummaryCards } from '@/components/ruang-proyek/stage-summary-cards';
import { RuangProyekWorkspace } from '@/components/ruang-proyek/workspace';
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

      <RuangProyekWorkspace
        panels={{
          plan: <PlanPanel />,
          dev: <DevPanel />,
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
    </div>
  );
}
