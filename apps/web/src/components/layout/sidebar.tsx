import { mockWorkspace } from '@/lib/mock/workspace';
import { ProjectPicker } from '@/components/ruang-proyek/project-picker';
import { SidebarNav } from './sidebar-nav';

/**
 * Rel navigasi kiri selebar 240px.
 *
 * Pemilih proyek sudah berfungsi; pemilih sprint menyusul di [F01-T08].
 * Pilihan proyek belum menyalur ke seluruh halaman — itu [F01-T09].
 */
export function Sidebar() {
  const { sprint } = mockWorkspace;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-border-subtle bg-surface lg:flex">
      <div className="p-4">
        <ProjectPicker />
        <p className="mt-2 px-1 text-xs text-text-muted">Sprint {sprint.sprintNumber}</p>
      </div>

      {/* Padding disamakan dengan blok pemilih di atas: kalau nav lebih lebar,
          pil menu aktif menyembul di sisi daftar proyek saat daftar terbuka. */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
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
