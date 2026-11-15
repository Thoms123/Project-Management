import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { StageTabs } from './stage-tabs';

const panels = {
  plan: <p>Isi Plan</p>,
  dev: <p>Isi Dev</p>,
  release: <p>Isi Release</p>,
};

describe('StageTabs', () => {
  it('menampilkan tiga tab berlabel Plan, Dev, dan Release', () => {
    render(<StageTabs panels={panels} />);

    expect(screen.getByRole('tab', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Dev' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Release' })).toBeInTheDocument();
  });

  it('menandai tab yang sedang aktif', () => {
    render(<StageTabs panels={panels} />);

    expect(screen.getByRole('tab', { name: 'Plan' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Dev' })).toHaveAttribute('aria-selected', 'false');
  });

  it('mengganti isi panel saat tab diklik', async () => {
    const user = userEvent.setup();
    render(<StageTabs panels={panels} />);

    expect(screen.getByText('Isi Plan')).toBeVisible();
    expect(screen.getByText('Isi Dev')).not.toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Dev' }));

    expect(screen.getByText('Isi Dev')).toBeVisible();
    expect(screen.getByText('Isi Plan')).not.toBeVisible();
  });

  // Pola tablist WAI-ARIA: panah berpindah tab, bukan Tab.
  it('bisa dipindah dengan tombol panah', async () => {
    const user = userEvent.setup();
    render(<StageTabs panels={panels} />);

    await user.click(screen.getByRole('tab', { name: 'Plan' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Dev' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Release' })).toHaveAttribute('aria-selected', 'true');

    // Dari tab terakhir, panah kanan berputar kembali ke awal.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Plan' })).toHaveAttribute('aria-selected', 'true');
  });

  it('hanya memasukkan tab aktif ke urutan Tab', () => {
    render(<StageTabs panels={panels} />);

    expect(screen.getByRole('tab', { name: 'Plan' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Dev' })).toHaveAttribute('tabindex', '-1');
  });

  // Kriteria: pilihan tab tetap konsisten saat pengguna berpindah proyek
  // atau sprint. Isi panel boleh berganti; tab yang dipilih tidak.
  it('mempertahankan tab terpilih saat isi panel berganti', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<StageTabs panels={panels} />);

    await user.click(screen.getByRole('tab', { name: 'Release' }));

    rerender(<StageTabs panels={{ ...panels, release: <p>Isi Release proyek lain</p> }} />);

    expect(screen.getByRole('tab', { name: 'Release' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Isi Release proyek lain')).toBeVisible();
  });

  it('memberi keterangan saat sebuah tahap belum punya isi', () => {
    render(<StageTabs panels={{ plan: <p>Isi Plan</p> }} />);
    expect(screen.getByText(/Belum ada isi untuk tahap Dev/)).toBeInTheDocument();
  });
});
