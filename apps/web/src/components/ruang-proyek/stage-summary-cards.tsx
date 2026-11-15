import type { ProjectStage, StageSummary } from '@rtl/shared';
import { mockStageSummaries } from '@/lib/mock/stage-summary';
import { STAGE_WORDING, persenTahap, ringkasTahap, tahapKosong } from '@/lib/stage-display';
import { cn } from '@/lib/utils';

/** Warna per tahap mengikuti token status pada design system. */
const STAGE_TONE: Record<ProjectStage, { badge: string; bar: string }> = {
  plan: { badge: 'bg-status-plan-bg text-status-plan', bar: 'bg-status-plan' },
  dev: { badge: 'bg-status-dev-bg text-status-dev', bar: 'bg-status-dev' },
  release: { badge: 'bg-status-ready-bg text-status-ready', bar: 'bg-status-ready' },
};

function StageCard({ stage }: { stage: StageSummary }) {
  const kata = STAGE_WORDING[stage.stage];
  const tone = STAGE_TONE[stage.stage];
  const kosong = tahapKosong(stage);
  const persen = persenTahap(stage);

  return (
    <article className="flex flex-col rounded-card bg-surface p-6 shadow-surface">
      <div className="flex items-center justify-between gap-2">
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', tone.badge)}>
          {kata.title}
        </span>
        {!kosong && (
          <span className="text-xs font-semibold text-text-muted">{persen}%</span>
        )}
      </div>

      {kosong ? (
        <p className="mt-4 flex-1 text-sm text-text-muted">{ringkasTahap(stage)}</p>
      ) : (
        <>
          <p className="mt-4 text-3xl font-bold tracking-tight text-text-display tabular-nums">
            {stage.completed}
            <span className="text-xl font-semibold text-text-muted">/{stage.total}</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">{ringkasTahap(stage)}</p>

          <div
            role="progressbar"
            aria-valuenow={persen}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${kata.title}: ${ringkasTahap(stage)}`}
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle"
          >
            <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${persen}%` }} />
          </div>

          {stage.details.length > 0 && (
            <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
              {stage.details.map((detail) => (
                <div key={detail.label} className="flex items-baseline gap-1.5">
                  <dt className="text-xs text-text-muted">{detail.label}</dt>
                  <dd className="text-xs font-semibold text-text-display tabular-nums">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </article>
  );
}

/**
 * Tiga kartu status tahap Plan, Dev, dan Release.
 *
 * Memberi gambaran sekilas kondisi proyek dalam satu pandangan, tanpa pengguna
 * perlu membuka menu lain.
 */
export function StageSummaryCards({
  stages = mockStageSummaries,
}: {
  stages?: StageSummary[];
}) {
  return (
    <section aria-label="Ringkasan tahap proyek">
      <h2 className="sr-only">Ringkasan tahap proyek</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <StageCard key={stage.stage} stage={stage} />
        ))}
      </div>
    </section>
  );
}
