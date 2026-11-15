import { ExternalLink } from 'lucide-react';
import type { ProjectPlan } from '@rtl/shared';
import { mockProjectPlan } from '@/lib/mock/plan';
import { mockWorkspace } from '@/lib/mock/workspace';

interface RowProps {
  label: string;
  /** Kosong berarti bagian ini belum diisi. */
  children: React.ReactNode | null;
  emptyHint: string;
}

function PlanRow({ label, children, emptyHint }: RowProps) {
  return (
    <div className="border-b border-border-subtle py-4 last:border-b-0 sm:grid sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-text-display">{label}</dt>
      <dd className="mt-1 text-sm sm:mt-0">
        {children ?? <span className="text-text-muted italic">{emptyHint}</span>}
      </dd>
    </div>
  );
}

/**
 * Ringkasan tahap Plan: dokumen PRD, tautan desain, mind map sprint, dan
 * catatan rencana.
 *
 * Hanya menampilkan. Pengisian dan penyuntingannya adalah fitur Rencana
 * Proyek [F03]; di sini pengguna cukup tahu apa yang sudah ada dan apa yang
 * belum tanpa berpindah halaman.
 */
export function PlanPanel({ plan = mockProjectPlan }: { plan?: ProjectPlan }) {
  const { company, project, sprint } = mockWorkspace;

  return (
    <div className="rounded-card bg-surface p-6 shadow-surface">
      <h3 className="text-base font-semibold text-text-display">Rencana proyek</h3>

      <dl className="mt-2">
        <PlanRow label="Dokumen PRD" emptyHint="Belum ada dokumen PRD.">
          {plan.prdLink ? (
            <a
              href={plan.prdLink}
              className="inline-flex items-center gap-1.5 font-medium text-brand hover:text-brand-hover hover:underline"
            >
              Buka PRD
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          ) : null}
        </PlanRow>

        <PlanRow label="Tautan desain" emptyHint="Tautan desain belum diisi.">
          {plan.designLink ? (
            <a
              href={plan.designLink}
              className="inline-flex items-center gap-1.5 font-medium text-brand hover:text-brand-hover hover:underline"
            >
              Buka desain
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          ) : null}
        </PlanRow>

        <PlanRow label="Mind map sprint" emptyHint="Konteks sprint belum ditentukan.">
          <span className="text-text-display">
            {company.name} — {project.name} — Sprint {sprint.sprintNumber}
          </span>
        </PlanRow>

        <PlanRow label="Catatan rencana" emptyHint="Belum ada catatan rencana.">
          {plan.notes ? <p className="whitespace-pre-line text-text-muted">{plan.notes}</p> : null}
        </PlanRow>
      </dl>
    </div>
  );
}
