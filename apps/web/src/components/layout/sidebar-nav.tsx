'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

/**
 * Daftar navigasi dengan penanda halaman aktif.
 *
 * Client component karena butuh `usePathname`; sisa sidebar tetap dirender di
 * server.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon, comingSoon }) => {
        const isActive = pathname === href;

        if (comingSoon) {
          return (
            <span
              key={href}
              aria-disabled="true"
              title="Belum tersedia"
              className="flex cursor-not-allowed items-center gap-3 rounded-nested px-3 py-2.5 text-sm font-medium text-text-muted/55"
            >
              <Icon aria-hidden className="size-[18px] shrink-0" />
              <span className="truncate">{label}</span>
            </span>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-nested px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand text-white'
                : 'text-text-muted hover:bg-surface-subtle hover:text-text-display',
            )}
          >
            <Icon aria-hidden className="size-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
