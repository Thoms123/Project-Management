import { mockWorkspace } from '@/lib/mock/workspace';
import { formatTanggal } from '@/lib/format';

/**
 * Kepala halaman: perusahaan, nama proyek, dan sprint aktif.
 *
 * Memenuhi kriteria pertama epic — "langsung melihat nama perusahaan, nama
 * proyek, serta sprint aktifnya" — tanpa perlu membuka menu lain.
 */
export function ContextHeader() {
  const { company, project, sprint } = mockWorkspace;

  const mulai = formatTanggal(sprint.startDate);
  const selesai = formatTanggal(sprint.endDate);
  const rentang = mulai && selesai ? `${mulai} – ${selesai}` : 'Jadwal belum ditentukan';

  return (
    <header>
      <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">
        {company.name}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-display sm:text-3xl">
          {project.name}
        </h1>
        <span className="rounded-full bg-status-plan-bg px-3 py-1 text-xs font-semibold text-status-plan">
          Sprint {sprint.sprintNumber}
          {sprint.status === 'aktif' ? ' (Aktif)' : ''}
        </span>
      </div>

      {project.description ? (
        <p className="mt-2 max-w-prose text-sm text-text-muted">{project.description}</p>
      ) : null}

      <p className="mt-2 text-sm text-text-muted">{rentang}</p>
    </header>
  );
}
