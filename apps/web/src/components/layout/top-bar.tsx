import { CalendarClock } from 'lucide-react';
import { mockWorkspace } from '@/lib/mock/workspace';
import { formatTanggal, sisaHari } from '@/lib/format';

/** Teks pendamping target rilis sprint pada bilah atas. */
function keteranganRilis(releaseTarget: string | null): string {
  const tanggal = formatTanggal(releaseTarget);
  if (!tanggal) return 'Target rilis belum ditentukan';

  const sisa = sisaHari(releaseTarget);
  if (sisa === null) return `Target rilis ${tanggal}`;
  if (sisa < 0) return `Terlambat ${Math.abs(sisa)} hari — target ${tanggal}`;
  if (sisa === 0) return `Rilis hari ini — ${tanggal}`;

  return `${sisa} hari menuju rilis — ${tanggal}`;
}

export function TopBar() {
  const { sprint } = mockWorkspace;

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border-subtle bg-surface/90 backdrop-blur-xl lg:left-60">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-sm text-text-muted">
          <CalendarClock aria-hidden className="size-4 shrink-0" />
          <span className="truncate">
            Sprint {sprint.sprintNumber} · {keteranganRilis(sprint.releaseTarget)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-text-display">Ferra Alexandra</p>
            <p className="text-xs text-text-muted">Lead Tech</p>
          </div>
          <div
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand"
          >
            FA
          </div>
        </div>
      </div>
    </header>
  );
}
