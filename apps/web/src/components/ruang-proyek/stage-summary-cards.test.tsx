import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { StageSummary } from '@rtl/shared';
import { StageSummaryCards } from './stage-summary-cards';

const terisi: StageSummary = {
  stage: 'dev',
  completed: 5,
  total: 8,
  details: [
    { label: 'Dikerjakan', value: 2 },
    { label: 'Selesai', value: 5 },
  ],
};

const kosong: StageSummary = { stage: 'release', completed: 0, total: 0, details: [] };

describe('StageSummaryCards', () => {
  it('menampilkan ketiga tahap dari data yang diberikan', () => {
    render(
      <StageSummaryCards
        stages={[{ stage: 'plan', completed: 3, total: 4, details: [] }, terisi, kosong]}
      />,
    );

    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('Release')).toBeInTheDocument();
  });

  // Kriteria: angka ditampilkan ringkas, mis. "5 tugas selesai dari 8".
  it('menuliskan angka dalam kalimat ringkas', () => {
    render(<StageSummaryCards stages={[terisi]} />);
    expect(screen.getByText('5 dari 8 tugas selesai')).toBeInTheDocument();
  });

  it('menampilkan rincian pendukung tiap tahap', () => {
    render(<StageSummaryCards stages={[terisi]} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '63');
    expect(screen.getByText('Dikerjakan')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // Kriteria: bila data suatu tahap masih kosong, muncul keterangan jelas.
  it('memberi keterangan yang bisa ditindaklanjuti saat tahap belum diisi', () => {
    render(<StageSummaryCards stages={[kosong]} />);

    expect(screen.getByText(/Dokumen rilis belum ada/)).toBeInTheDocument();
    // "0 dari 0" membingungkan dan tidak memberi tahu apa yang harus dilakukan.
    expect(screen.queryByText(/0 dari 0/)).not.toBeInTheDocument();
  });

  it('tidak menampilkan bilah progres untuk tahap yang belum diisi', () => {
    render(<StageSummaryCards stages={[kosong]} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('memakai data tiruan bila tidak diberi prop', () => {
    render(<StageSummaryCards />);
    const kartuDev = screen.getByText('Dev').closest('article');
    expect(within(kartuDev as HTMLElement).getByText('5 dari 8 tugas selesai')).toBeInTheDocument();
  });
});
