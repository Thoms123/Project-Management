'use client';

import { ChevronRight, CircleCheck } from 'lucide-react';
import type { ProjectStage, ReadinessItem } from '@rtl/shared';
import { mockReadinessItems } from '@/lib/mock/readiness-items';
import { SECTION_TARGET, butirBelumLengkap } from '@/lib/readiness-sections';

interface ReadinessPanelProps {
  items?: ReadinessItem[];
  /** Membuka tahap terkait di tab Plan–Dev–Release. */
  onOpenStage: (stage: ProjectStage) => void;
}

function ItemContent({ item, sectionLabel }: { item: ReadinessItem; sectionLabel: string }) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-display">{item.label}</span>
        {item.hint ? (
          <span className="mt-0.5 block text-xs text-text-muted">{item.hint}</span>
        ) : null}
      </span>
      <span className="shrink-0 rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-text-muted">
        {sectionLabel}
      </span>
    </>
  );
}

/**
 * Daftar hal yang belum lengkap sebelum rilis.
 *
 * Hanya memuat butir yang belum beres — daftar ini untuk dikerjakan, bukan
 * untuk dibaca-baca. Jumlah keseluruhan sudah disampaikan indikator kesiapan
 * di atasnya.
 */
export function ReadinessPanel({ items = mockReadinessItems, onOpenStage }: ReadinessPanelProps) {
  const kurang = butirBelumLengkap(items);

  if (kurang.length === 0) {
    return (
      <section
        aria-label="Daftar kekurangan rilis"
        className="flex items-center gap-3 rounded-card bg-surface p-6 shadow-surface"
      >
        <CircleCheck aria-hidden className="size-5 shrink-0 text-status-ready" />
        <p className="text-sm text-text-display">
          Tidak ada yang tertinggal. Semua butir kesiapan sudah lengkap.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Daftar kekurangan rilis"
      className="rounded-card bg-surface p-6 shadow-surface"
    >
      <h3 className="text-base font-semibold text-text-display">Yang masih harus dibereskan</h3>
      <p className="mt-1 text-sm text-text-muted">
        {kurang.length} hal perlu dilengkapi sebelum rilis.
      </p>

      <ul className="mt-4 flex flex-col gap-1">
        {kurang.map((item) => {
          const target = SECTION_TARGET[item.section];

          if (target.kind === 'stage') {
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenStage(target.stage)}
                  className="flex w-full items-center gap-3 rounded-nested p-3 text-left transition-colors hover:bg-surface-subtle"
                >
                  <ItemContent item={item} sectionLabel={target.label} />
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-text-muted" />
                </button>
              </li>
            );
          }

          // Tujuannya belum dibangun. Ditampilkan apa adanya, lengkap dengan
          // keterangan di mana nanti bisa dibereskan.
          return (
            <li key={item.id} className="flex items-center gap-3 p-3">
              <ItemContent item={item} sectionLabel={target.label} />
              <span className="shrink-0 text-xs text-text-muted italic">
                di {target.pendingIn}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
