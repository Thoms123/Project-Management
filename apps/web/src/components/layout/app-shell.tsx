import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

/**
 * Kerangka aplikasi: rel navigasi kiri, bilah atas, dan kanvas konten.
 *
 * Di bawah lg sidebar disembunyikan — navigasi layar kecil dikerjakan di
 * [F01-T11] bersama perapian responsif lainnya.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <TopBar />
      <main className="px-4 pt-16 pb-10 sm:px-6 lg:pl-66">
        <div className="mx-auto w-full max-w-6xl pt-6">{children}</div>
      </main>
    </div>
  );
}
