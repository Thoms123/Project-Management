import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Task } from '@rtl/shared';
import { DevPanel } from './dev-panel';

const dasar = {
  projectId: 'p-1', sprintId: 's-12', planId: null, description: null,
  createdAt: '2026-11-03T03:00:00.000Z',
};

const tugas: Task[] = [
  { ...dasar, id: 'a', title: 'Sudah beres', status: 'selesai', priority: 'santai',
    featureBranch: 'feature/x', taskBranch: 'task/a' },
  { ...dasar, id: 'b', title: 'Belum disentuh', status: 'belum_mulai', priority: 'mendesak',
    featureBranch: null, taskBranch: null },
  { ...dasar, id: 'c', title: 'Sedang jalan', status: 'dikerjakan', priority: 'sedang',
    featureBranch: 'feature/y', taskBranch: 'task/c' },
];

describe('DevPanel', () => {
  // Yang masih menuntut perhatian harus muncul lebih dulu, bukan terkubur
  // di bawah daftar pekerjaan yang sudah beres.
  it('mengurutkan tugas mengikuti alur papan: belum mulai, dikerjakan, selesai', () => {
    render(<DevPanel tasks={tugas} />);

    // Dicocokkan persis: lencana status juga memuat kata "Belum", sehingga
    // pencocokan longgar akan menangkap elemen yang salah.
    const judul = screen
      .getAllByRole('listitem')
      .map((li) => within(li).getByText(/^(Sudah beres|Belum disentuh|Sedang jalan)$/).textContent);
    expect(judul).toEqual(['Belum disentuh', 'Sedang jalan', 'Sudah beres']);
  });

  it('menampilkan cabang fitur dan cabang tugas', () => {
    render(<DevPanel tasks={tugas} />);
    expect(screen.getByText('feature/y / task/c')).toBeInTheDocument();
  });

  it('menyebutkan tugas yang cabangnya belum dicatat', () => {
    render(<DevPanel tasks={tugas} />);
    expect(screen.getByText('Cabang kerja belum dicatat.')).toBeInTheDocument();
  });

  it('menampilkan label status dan prioritas', () => {
    render(<DevPanel tasks={tugas} />);

    expect(screen.getByText('Mendesak')).toBeInTheDocument();
    expect(screen.getByText('Dikerjakan')).toBeInTheDocument();
    expect(screen.getByText('Selesai')).toBeInTheDocument();
  });

  it('menampilkan jumlah tugas', () => {
    render(<DevPanel tasks={tugas} />);
    expect(screen.getByText('3 tugas')).toBeInTheDocument();
  });

  it('memberi keterangan saat sprint belum punya tugas', () => {
    render(<DevPanel tasks={[]} />);
    expect(screen.getByText('Belum ada tugas di sprint ini.')).toBeInTheDocument();
  });
});
