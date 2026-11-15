import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RuangProyekWorkspace } from './workspace';

const panels = {
  plan: <p>Isi Plan</p>,
  dev: <p>Isi Dev</p>,
  release: <p>Isi Release</p>,
};

describe('RuangProyekWorkspace', () => {
  it('membuka tab Plan saat butir rencana diklik', async () => {
    const user = userEvent.setup();
    render(<RuangProyekWorkspace panels={panels} />);

    // Mulai dari tab lain supaya perpindahannya benar-benar teruji.
    await user.click(screen.getByRole('tab', { name: 'Release' }));
    expect(screen.getByText('Isi Plan')).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: /Tautan desain belum diisi/ }));

    expect(screen.getByRole('tab', { name: 'Plan' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Isi Plan')).toBeVisible();
  });

  it('membuka tab Dev saat butir tugas diklik', async () => {
    const user = userEvent.setup();
    render(<RuangProyekWorkspace panels={panels} />);

    await user.click(screen.getByRole('button', { name: /tugas belum mencatat cabang kerja/ }));

    expect(screen.getByRole('tab', { name: 'Dev' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Isi Dev')).toBeVisible();
  });

  // Pemanggilnya ada di bagian lain halaman, jadi tanpa perpindahan fokus
  // tidak ada tanda apa pun bahwa sesuatu berubah — terutama bagi pembaca layar.
  it('memindahkan fokus ke isi tahap yang dibuka', async () => {
    const user = userEvent.setup();
    render(<RuangProyekWorkspace panels={panels} />);

    await user.click(screen.getByRole('button', { name: /2 tugas masih dikerjakan/ }));

    const panelDev = screen.getByText('Isi Dev').closest('[role="tabpanel"]');
    expect(panelDev).toHaveFocus();
  });

  // Kriteria F01-T04: pilihan tab tetap konsisten saat berpindah proyek atau
  // sprint. Isi panel boleh berganti; tab yang dipilih tidak.
  it('mempertahankan tab terpilih saat isi panel berganti', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RuangProyekWorkspace panels={panels} />);

    await user.click(screen.getByRole('tab', { name: 'Release' }));

    rerender(
      <RuangProyekWorkspace panels={{ ...panels, release: <p>Isi Release proyek lain</p> }} />,
    );

    expect(screen.getByRole('tab', { name: 'Release' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Isi Release proyek lain')).toBeVisible();
  });
});
