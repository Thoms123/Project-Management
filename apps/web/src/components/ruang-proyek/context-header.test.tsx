import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContextHeader } from './context-header';
import { mockWorkspace } from '@/lib/mock/workspace';

describe('ContextHeader', () => {
  // Kriteria pertama epic Ruang Proyek: ketiganya harus terlihat begitu
  // halaman dibuka, tanpa membuka menu lain.
  it('menampilkan perusahaan, proyek, dan sprint aktif sekaligus', () => {
    render(<ContextHeader />);

    expect(screen.getByText(mockWorkspace.company.name)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: mockWorkspace.project.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sprint 12/)).toBeInTheDocument();
  });

  it('menandai sprint yang sedang aktif', () => {
    render(<ContextHeader />);
    expect(screen.getByText(/Sprint 12\s*\(Aktif\)/)).toBeInTheDocument();
  });

  it('menampilkan rentang tanggal sprint dalam format yang mudah dibaca', () => {
    render(<ContextHeader />);
    expect(screen.getByText('3 Nov 2026 – 21 Nov 2026')).toBeInTheDocument();
  });
});
