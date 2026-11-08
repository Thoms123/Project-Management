import { PROJECT_STAGE_LABELS, PROJECT_STAGES } from '@rtl/shared';

/**
 * Halaman sementara penanda scaffold.
 *
 * Ruang Proyek yang sebenarnya dikerjakan di [F01-T01]; halaman ini hanya
 * membuktikan rantai Next.js → Tailwind → @rtl/shared sudah tersambung.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">Scaffold siap</p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-display sm:text-4xl">
        Rilis Tanpa Lupa
      </h1>

      <p className="mt-4 text-text-muted">
        Kumpulkan seluruh kebutuhan proyek — rencana, tugas, env, database, dan dokumen rilis —
        dalam satu tempat.
      </p>

      <div className="mt-10 rounded-card bg-surface p-6 shadow-surface">
        <h2 className="text-base font-semibold">Tahap proyek</h2>
        <p className="mt-1 text-sm text-text-muted">
          Dibaca dari <code className="font-mono text-xs">@rtl/shared</code>.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {PROJECT_STAGES.map((stage) => (
            <span
              key={stage}
              className="rounded-full bg-brand-soft px-4 py-1.5 text-sm font-semibold text-brand"
            >
              {PROJECT_STAGE_LABELS[stage]}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-text-muted">
        Task berikutnya:{' '}
        <a
          className="font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
          href="https://github.com/Thoms123/Project-Management/issues/4"
        >
          #4 — Bangun halaman utama Ruang Proyek
        </a>
      </p>
    </main>
  );
}
