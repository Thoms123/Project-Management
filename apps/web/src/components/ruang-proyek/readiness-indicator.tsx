import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react';
import type { ReadinessSummary } from '@rtl/shared';
import { mockReadiness } from '@/lib/mock/readiness';
import { kalimatKesiapan, statusKesiapan, type ReadinessState } from '@/lib/readiness-display';
import { cn } from '@/lib/utils';

const TONE: Record<
  ReadinessState,
  { wrapper: string; icon: typeof CircleCheck; iconClass: string; badge: string }
> = {
  siap: {
    wrapper: 'border-status-ready/25 bg-status-ready-bg/40',
    icon: CircleCheck,
    iconClass: 'text-status-ready',
    badge: 'bg-status-ready-bg text-status-ready',
  },
  ada_kekurangan: {
    wrapper: 'border-status-dev/25 bg-status-dev-bg/40',
    icon: CircleAlert,
    iconClass: 'text-status-dev',
    badge: 'bg-status-dev-bg text-status-dev',
  },
  belum_diperiksa: {
    wrapper: 'border-border-subtle bg-surface',
    icon: CircleDashed,
    iconClass: 'text-text-muted',
    badge: 'bg-surface-subtle text-text-muted',
  },
};

/**
 * Penanda ringkas kesiapan rilis: siap, ada yang kurang, atau belum diperiksa.
 *
 * Hanya menyampaikan status dan jumlah. Daftar butir yang kurang beserta
 * tautannya ke bagian terkait dikerjakan di [F01-T06]; sengaja tidak ada
 * tombol "lihat daftar" di sini selama panelnya belum ada, supaya tidak
 * menjanjikan tujuan yang belum bisa dibuka.
 */
export function ReadinessIndicator({
  summary = mockReadiness,
}: {
  summary?: ReadinessSummary;
}) {
  const state = statusKesiapan(summary);
  const tone = TONE[state];
  const { title, description } = kalimatKesiapan(summary);
  const Icon = tone.icon;

  return (
    <section
      aria-label="Kesiapan rilis"
      className={cn('flex items-start gap-4 rounded-card border p-5', tone.wrapper)}
    >
      <Icon aria-hidden className={cn('mt-0.5 size-6 shrink-0', tone.iconClass)} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-text-display">{title}</h2>
          {state !== 'belum_diperiksa' && (
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', tone.badge)}>
              {summary.totalItems - summary.incompleteItems}/{summary.totalItems} beres
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
    </section>
  );
}
