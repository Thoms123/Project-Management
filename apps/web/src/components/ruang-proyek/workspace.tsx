'use client';

import { useRef, useState, type ReactNode } from 'react';
import type { ProjectStage } from '@rtl/shared';
import { ReadinessPanel } from './readiness-panel';
import { StageTabs, type StageTabsHandle } from './stage-tabs';

/**
 * Menyatukan tab tahap dengan daftar kekurangan rilis.
 *
 * Keduanya harus berbagi tahap aktif supaya sebuah butir kekurangan bisa
 * membuka tahap terkait. Komponen ini yang memegangnya.
 *
 * Tahap aktif sengaja disimpan terpisah dari proyek/sprint yang dipilih,
 * sehingga pilihan tab tidak ikut tereset saat pengguna berganti proyek nanti
 * ([F01-T07]–[F01-T09]). Jangan beri komponen ini `key` yang berisi id proyek:
 * itu akan me-remount-nya dan diam-diam mematahkan perilaku tersebut.
 */
export function RuangProyekWorkspace({
  panels,
}: {
  panels: Partial<Record<ProjectStage, ReactNode>>;
}) {
  const [stage, setStage] = useState<ProjectStage>('plan');
  const tabsRef = useRef<StageTabsHandle | null>(null);

  return (
    <>
      <StageTabs
        panels={panels}
        activeStage={stage}
        onStageChange={setStage}
        handleRef={tabsRef}
      />

      <ReadinessPanel onOpenStage={(target) => tabsRef.current?.openStage(target)} />
    </>
  );
}
