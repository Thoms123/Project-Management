'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { PROJECT_STAGES, PROJECT_STAGE_LABELS, type ProjectStage } from '@rtl/shared';
import { cn } from '@/lib/utils';

interface StageTabsProps {
  /** Isi tiap tahap. Tahap tanpa isi menampilkan panel kosong. */
  panels: Partial<Record<ProjectStage, ReactNode>>;
  defaultStage?: ProjectStage;
}

/**
 * Tab Plan – Dev – Release.
 *
 * Pilihan tab disimpan di state komponen, bukan diturunkan dari proyek atau
 * sprint yang sedang dipilih. Itu yang membuatnya tetap bertahan saat pengguna
 * berganti proyek atau sprint nanti ([F01-T07]–[F01-T09]) — selama komponen ini
 * tidak di-remount, mis. jangan beri `key` yang berisi id proyek.
 *
 * Berpindah tab hanya menukar panel; tidak ada navigasi, jadi halaman tidak
 * dimuat ulang.
 */
export function StageTabs({ panels, defaultStage = 'plan' }: StageTabsProps) {
  const [active, setActive] = useState<ProjectStage>(defaultStage);
  const tabRefs = useRef<Partial<Record<ProjectStage, HTMLButtonElement | null>>>({});

  function focusStage(stage: ProjectStage) {
    setActive(stage);
    tabRefs.current[stage]?.focus();
  }

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
              onClick={() => setActive(stage)}
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
