import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReadinessIndicator } from './readiness-indicator';

describe('ReadinessIndicator', () => {
  // Kriteria: jumlah butir yang belum lengkap terlihat di ringkasan halaman.
  it('menampilkan jumlah hal yang belum lengkap', () => {
    render(<ReadinessIndicator summary={{ totalItems: 12, incompleteItems: 4 }} />);

    expect(screen.getByText('4 hal belum lengkap')).toBeInTheDocument();
    expect(screen.getByText('8/12 beres')).toBeInTheDocument();
  });

  // Kriteria: bila semua sudah lengkap, tampil pesan jelas bahwa proyek siap.
  it('menyatakan siap dirilis saat tidak ada kekurangan', () => {
    render(<ReadinessIndicator summary={{ totalItems: 12, incompleteItems: 0 }} />);
    expect(screen.getByText('Siap dirilis')).toBeInTheDocument();
  });

  it('tidak menyatakan siap pada proyek yang belum diperiksa', () => {
    render(<ReadinessIndicator summary={{ totalItems: 0, incompleteItems: 0 }} />);

    expect(screen.getByText('Belum ada yang diperiksa')).toBeInTheDocument();
    expect(screen.queryByText('Siap dirilis')).not.toBeInTheDocument();
    // "0/0 beres" tidak punya makna; lencana itu disembunyikan.
    expect(screen.queryByText(/beres/)).not.toBeInTheDocument();
  });

  it('memakai data tiruan bila tidak diberi prop', () => {
    render(<ReadinessIndicator />);
    expect(screen.getByRole('region', { name: 'Kesiapan rilis' })).toBeInTheDocument();
  });
});
