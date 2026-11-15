import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarNav } from './sidebar-nav';

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: usePathnameMock }));

describe('SidebarNav', () => {
  it('menandai halaman yang sedang dibuka', () => {
    usePathnameMock.mockReturnValue('/');
    render(<SidebarNav />);

    expect(screen.getByRole('link', { name: 'Ruang Proyek' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  // Tujuan yang halamannya belum dibangun tidak boleh dirender sebagai tautan:
  // mengkliknya akan membawa pengguna ke halaman 404.
  it('tidak membuat tautan untuk menu yang halamannya belum ada', () => {
    usePathnameMock.mockReturnValue('/');
    render(<SidebarNav />);

    expect(screen.queryByRole('link', { name: 'Papan Tugas' })).not.toBeInTheDocument();
    expect(screen.getByText('Papan Tugas')).toBeInTheDocument();
  });
});
