import { ContextHeader } from '@/components/ruang-proyek/context-header';
import { PendingSection } from '@/components/ui/pending-section';

export const metadata = {
  title: 'Ruang Proyek — Rilis Tanpa Lupa',
};

/**
 * Ruang Proyek — layar utama aplikasi.
 *
 * Task ini [F01-T01] membangun kerangkanya: kepala konteks dan susunan bagian.
 * Setiap bagian lain diisi task tersendiri, ditandai eksplisit di bawah agar
 * terlihat mana yang sudah jadi dan mana yang belum.
 */
export default function RuangProyekPage() {
  return (
    <div className="flex flex-col gap-6">
      <ContextHeader />

      <PendingSection
        title="Ringkasan Proyek"
        description="Kartu status Plan, Dev, dan Release dalam satu pandangan — jumlah dokumen rencana terisi, tugas per status, dan dokumen rilis lengkap."
        taskKey="F01-T02"
        issue={5}
      />

      <PendingSection
        title="Indikator Kesiapan Rilis"
        description="Penanda ringkas siap atau belum, beserta jumlah butir yang masih kurang."
        taskKey="F01-T03"
        issue={6}
      />

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
