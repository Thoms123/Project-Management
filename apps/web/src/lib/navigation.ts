import { LayoutDashboard, KanbanSquare, Terminal, FileCheck2, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Halaman belum dibangun; ditandai di sidebar agar tidak terlihat rusak. */
  comingSoon?: boolean;
}

/**
 * Menu navigasi utama, mengikuti pengelompokan fitur pada roadmap.
 *
 * Tujuan selain Ruang Proyek belum punya halaman — ditandai `comingSoon`
 * sampai fitur terkait dikerjakan.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Ruang Proyek', icon: LayoutDashboard },
  { href: '/papan-tugas', label: 'Papan Tugas', icon: KanbanSquare, comingSoon: true },
  { href: '/kesiapan-teknis', label: 'Kesiapan Teknis', icon: Terminal, comingSoon: true },
  { href: '/dokumen-rilis', label: 'Dokumen & Rilis', icon: FileCheck2, comingSoon: true },
  { href: '/pengaturan', label: 'Pengaturan Proyek & Tim', icon: Settings, comingSoon: true },
];
