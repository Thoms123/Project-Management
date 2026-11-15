import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProjectPlan } from '@rtl/shared';
import { PlanPanel } from './plan-panel';

const lengkap: ProjectPlan = {
  id: 'pl-1',
  projectId: 'p-1',
  prdLink: 'https://contoh/prd',
  prdFileUrl: null,
  designLink: 'https://contoh/desain',
  notes: 'Catatan penting.',
  createdAt: '2026-11-03T02:00:00.000Z',
};

describe('PlanPanel', () => {
  it('menampilkan tautan PRD dan desain yang bisa dibuka', () => {
    render(<PlanPanel plan={lengkap} />);

    expect(screen.getByRole('link', { name: /Buka PRD/ })).toHaveAttribute(
      'href',
      'https://contoh/prd',
    );
    expect(screen.getByRole('link', { name: /Buka desain/ })).toHaveAttribute(
      'href',
      'https://contoh/desain',
    );
  });

  it('menampilkan catatan rencana', () => {
    render(<PlanPanel plan={lengkap} />);
    expect(screen.getByText('Catatan penting.')).toBeInTheDocument();
  });

  it('menampilkan konteks mind map sprint', () => {
    render(<PlanPanel plan={lengkap} />);
    expect(screen.getByText(/PT Teknologi Nusantara — Payment Gateway V2 — Sprint 12/))
      .toBeInTheDocument();
  });

  // Bagian kosong harus disebut terang-terangan. Baris yang hilang begitu saja
  // membuat pengguna mengira semuanya sudah terisi.
  it('menyebutkan bagian yang belum diisi, bukan menyembunyikannya', () => {
    render(<PlanPanel plan={{ ...lengkap, designLink: null, notes: null }} />);

    expect(screen.getByText('Tautan desain belum diisi.')).toBeInTheDocument();
    expect(screen.getByText('Belum ada catatan rencana.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Buka desain/ })).not.toBeInTheDocument();
  });
});
