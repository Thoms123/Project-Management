import { ContextHeader } from '@/components/ruang-proyek/context-header';
import { ReadinessIndicator } from '@/components/ruang-proyek/readiness-indicator';
import { StageSummaryCards } from '@/components/ruang-proyek/stage-summary-cards';
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

      <PendingSection
        title="Tab Plan – Dev – Release"
        description="Berpindah antar tahap proyek dalam satu halaman tanpa memuat ulang."
        taskKey="F01-T04"
        issue={7}
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
