import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReadinessItem } from '@rtl/shared';
import { ReadinessPanel } from './readiness-panel';

const items: ReadinessItem[] = [
  { id: 'a', section: 'rencana', isComplete: false, label: 'Tautan desain belum diisi', hint: 'Acuan UI belum ada.' },
  { id: 'b', section: 'tugas', isComplete: false, label: '2 tugas masih dikerjakan', hint: null },
  { id: 'c', section: 'env', isComplete: false, label: 'PAYMENT_API_KEY belum disiapkan', hint: null },
  { id: 'd', section: 'rencana', isComplete: true, label: 'Dokumen PRD tersimpan', hint: null },
];

describe('ReadinessPanel', () => {
  // Daftar ini untuk dikerjakan, bukan untuk dibaca-baca. Butir yang sudah
  // beres hanya menambah panjang tanpa menambah informasi.
  it('hanya menampilkan butir yang belum lengkap', () => {
    render(<ReadinessPanel items={items} onOpenStage={() => {}} />);

    expect(screen.getByText('Tautan desain belum diisi')).toBeInTheDocument();
    expect(screen.queryByText('Dokumen PRD tersimpan')).not.toBeInTheDocument();
    expect(screen.getByText('3 hal perlu dilengkapi sebelum rilis.')).toBeInTheDocument();
  });

  it('menampilkan keterangan singkat tiap butir', () => {
    render(<ReadinessPanel items={items} onOpenStage={() => {}} />);
    expect(screen.getByText('Acuan UI belum ada.')).toBeInTheDocument();
  });

  // Kriteria: setiap butir bisa diklik untuk menuju bagian terkait.
  it('membuka tahap terkait saat butir diklik', async () => {
    const user = userEvent.setup();
    const onOpenStage = vi.fn();
    render(<ReadinessPanel items={items} onOpenStage={onOpenStage} />);

    await user.click(screen.getByRole('button', { name: /Tautan desain belum diisi/ }));
    expect(onOpenStage).toHaveBeenCalledWith('plan');

    await user.click(screen.getByRole('button', { name: /2 tugas masih dikerjakan/ }));
    expect(onOpenStage).toHaveBeenCalledWith('dev');
  });

  // Tombol yang tidak membawa ke mana-mana lebih membingungkan daripada
  // tidak ada tombol sama sekali.
  it('tidak menjadikan butir tombol bila tujuannya belum dibangun', () => {
    render(<ReadinessPanel items={items} onOpenStage={() => {}} />);

    expect(
      screen.queryByRole('button', { name: /PAYMENT_API_KEY/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('PAYMENT_API_KEY belum disiapkan')).toBeInTheDocument();
    expect(screen.getByText('di Daftar Rahasia')).toBeInTheDocument();
  });

  it('menyatakan tidak ada yang tertinggal saat semua lengkap', () => {
    render(
      <ReadinessPanel
        items={items.map((i) => ({ ...i, isComplete: true }))}
        onOpenStage={() => {}}
      />,
    );

    expect(screen.getByText(/Tidak ada yang tertinggal/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
