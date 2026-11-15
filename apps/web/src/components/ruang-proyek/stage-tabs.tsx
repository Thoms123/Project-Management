'use client';

import {
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { PROJECT_STAGES, PROJECT_STAGE_LABELS, type ProjectStage } from '@rtl/shared';
import { cn } from '@/lib/utils';

/** Cara memerintah tab dari luar, mis. dari daftar kekurangan rilis. */
export interface StageTabsHandle {
  /** Membuka satu tahap lalu memindahkan fokus ke isinya. */
  openStage: (stage: ProjectStage) => void;
}

interface StageTabsProps {
  /** Isi tiap tahap. Tahap tanpa isi menampilkan panel kosong. */
  panels: Partial<Record<ProjectStage, ReactNode>>;
  activeStage: ProjectStage;
  onStageChange: (stage: ProjectStage) => void;
  handleRef?: RefObject<StageTabsHandle | null>;
}

/**
 * Tab Plan – Dev – Release.
 *
 * Tahap aktif dikendalikan dari luar supaya bagian lain halaman — daftar
 * kekurangan rilis — bisa membuka tahap tertentu. Pemiliknya tetap harus
 * menyimpannya terpisah dari proyek/sprint yang dipilih, agar pilihan tab
 * bertahan saat pengguna berganti proyek nanti ([F01-T07]–[F01-T09]).
 *
 * Berpindah tab hanya menukar panel; tidak ada navigasi, jadi halaman tidak
 * dimuat ulang.
 */
export function StageTabs({ panels, activeStage, onStageChange, handleRef }: StageTabsProps) {
  const active = activeStage;
  const tabRefs = useRef<Partial<Record<ProjectStage, HTMLButtonElement | null>>>({});
  const panelRefs = useRef<Partial<Record<ProjectStage, HTMLDivElement | null>>>({});

  function focusStage(stage: ProjectStage) {
    onStageChange(stage);
    tabRefs.current[stage]?.focus();
  }

  const menungguFokus = useRef<ProjectStage | null>(null);

  // Fokus tidak bisa dipindah di openStage: saat itu panel tujuan masih
  // `hidden` karena React belum render ulang, dan memanggil focus() pada
  // elemen tersembunyi tidak melakukan apa-apa. Jadi niatnya dicatat dulu,
  // lalu dijalankan setelah tahap aktif benar-benar berubah.
  useEffect(() => {
    const tujuan = menungguFokus.current;
    if (tujuan && tujuan === active) {
      panelRefs.current[tujuan]?.focus();
      menungguFokus.current = null;
    }
  }, [active]);

  useImperativeHandle(handleRef, () => ({
    // Fokus dipindah ke isi panel, bukan ke tabnya: pemanggil datang dari
    // bagian lain halaman, jadi tanpa ini tidak ada tanda apa pun bahwa
    // sesuatu berpindah — terutama bagi pembaca layar.
    openStage(stage) {
      menungguFokus.current = stage;
      onStageChange(stage);
    },
  }));

  // Pola tablist WAI-ARIA: panah berpindah antar tab dan langsung
  // mengaktifkannya, Home/End melompat ke ujung.
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = PROJECT_STAGES.indexOf(active);
    const last = PROJECT_STAGES.length - 1;

    let next: ProjectStage | undefined;
    if (event.key === 'ArrowRight') next = PROJECT_STAGES[index === last ? 0 : index + 1];
    else if (event.key === 'ArrowLeft') next = PROJECT_STAGES[index === 0 ? last : index - 1];
    else if (event.key === 'Home') next = PROJECT_STAGES[0];
    else if (event.key === 'End') next = PROJECT_STAGES[last];

    if (next) {
      event.preventDefault();
      focusStage(next);
    }
  }

  return (
    <section aria-label="Tahap proyek">
      <div
        role="tablist"
        aria-label="Tahap proyek"
        className="inline-flex gap-1 rounded-full bg-surface p-1 shadow-surface"
      >
        {PROJECT_STAGES.map((stage) => {
          const isActive = stage === active;
          return (
            <button
              key={stage}
              ref={(el) => {
                tabRefs.current[stage] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${stage}`}
              aria-selected={isActive}
              aria-controls={`panel-${stage}`}
              // Hanya tab aktif yang masuk urutan Tab; sisanya dijangkau
              // dengan panah, sesuai pola tablist.
              tabIndex={isActive ? 0 : -1}
              onClick={() => onStageChange(stage)}
              onKeyDown={handleKeyDown}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-brand text-white'
                  : 'text-text-muted hover:bg-surface-subtle hover:text-text-display',
              )}
            >
              {PROJECT_STAGE_LABELS[stage]}
            </button>
          );
        })}
      </div>

      {PROJECT_STAGES.map((stage) => (
        <div
          key={stage}
          ref={(el) => {
            panelRefs.current[stage] = el;
          }}
          role="tabpanel"
          id={`panel-${stage}`}
          aria-labelledby={`tab-${stage}`}
          hidden={stage !== active}
          tabIndex={0}
          className="mt-4 focus-visible:outline-brand"
        >
          {panels[stage] ?? (
            <p className="rounded-card bg-surface p-6 text-sm text-text-muted shadow-surface">
              Belum ada isi untuk tahap {PROJECT_STAGE_LABELS[stage]}.
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
