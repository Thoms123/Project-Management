import { ChevronsUpDown } from 'lucide-react';
import { mockWorkspace } from '@/lib/mock/workspace';
import { SidebarNav } from './sidebar-nav';

/**
 * Rel navigasi kiri selebar 240px.
 *
 * Blok konteks di atas masih statis. Pemilih proyek dan sprint yang
 * sesungguhnya dikerjakan di [F01-T07] dan [F01-T08]; tombolnya sudah ada di
 * sini sebagai tempatnya, tapi sengaja dinonaktifkan supaya tidak terlihat
 * bisa diklik padahal belum melakukan apa pun.
 */
export function Sidebar() {
  const { company, project, sprint } = mockWorkspace;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-border-subtle bg-surface lg:flex">
      <div className="p-4">
        <button
          type="button"
          disabled
          title="Pemilih proyek & sprint — dikerjakan di F01-T07/T08"
          className="flex w-full cursor-not-allowed items-center gap-2 rounded-nested border border-border-subtle p-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold tracking-wide text-text-muted uppercase">
              {company.name}
            </span>
            <span className="mt-0.5 block truncate text-sm font-bold text-text-display">
              {project.name}
            </span>
            <span className="mt-0.5 block text-xs text-text-muted">
              Sprint {sprint.sprintNumber}
            </span>
          </span>
          <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          Menu navigasi
        </p>
        <SidebarNav />
      </div>

      <div className="border-t border-border-subtle p-4">
        <p className="text-xs text-text-muted">Rilis Tanpa Lupa</p>
        <p className="mt-0.5 text-[11px] text-text-muted/70">Versi pengembangan</p>
      </div>
    </aside>
  );
}
