import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProjectPicker } from './project-picker';

const bukaDaftar = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /Pilih proyek lain/ }));
};

describe('ProjectPicker', () => {
  it('menampilkan proyek aktif beserta perusahaannya', () => {
    render(<ProjectPicker />);

    expect(screen.getByText('Payment Gateway V2')).toBeInTheDocument();
    expect(screen.getByText('PT Teknologi Nusantara')).toBeInTheDocument();
  });

  it('tidak menampilkan daftar sebelum dibuka', () => {
    render(<ProjectPicker />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // Kriteria: kolom pencarian menampilkan hasil yang cocok saat mengetik.
  it('menyaring daftar saat pengguna mengetik', async () => {
    const user = userEvent.setup();
    render(<ProjectPicker />);
    await bukaDaftar(user);

    expect(screen.getAllByRole('option')).toHaveLength(5);

    await user.type(screen.getByRole('combobox'), 'portal');

    const hasil = screen.getAllByRole('option');
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toHaveTextContent('Portal Merchant');
  });

  it('memberi keterangan saat tidak ada yang cocok', async () => {
    const user = userEvent.setup();
    render(<ProjectPicker />);
    await bukaDaftar(user);

    await user.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText(/Tidak ada proyek yang cocok/)).toBeInTheDocument();
  });

  // Langsung bisa mengetik begitu daftar terbuka, tanpa harus mengklik
  // kolom pencariannya dulu.
  it('memindahkan fokus ke kolom pencarian saat daftar dibuka', async () => {
    const user = userEvent.setup();
    render(<ProjectPicker />);
    await bukaDaftar(user);

    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('mengganti proyek aktif saat sebuah hasil diklik', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ProjectPicker onSelect={onSelect} />);
    await bukaDaftar(user);

    await user.click(screen.getByRole('option', { name: /Aplikasi Absensi/ }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ project: expect.objectContaining({ name: 'Aplikasi Absensi' }) }),
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aplikasi Absensi/ })).toBeInTheDocument();
  });

  it('bisa dipilih dengan panah dan Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ProjectPicker onSelect={onSelect} />);
    await bukaDaftar(user);

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ project: expect.objectContaining({ name: 'Portal Merchant' }) }),
    );
  });

  it('menutup daftar saat Escape ditekan', async () => {
    const user = userEvent.setup();
    render(<ProjectPicker />);
    await bukaDaftar(user);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // Daftar yang menggantung terbuka menutupi navigasi di bawahnya.
  it('menutup daftar saat diklik di luar', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ProjectPicker />
        <button type="button">Di luar</button>
      </div>,
    );
    await bukaDaftar(user);

    await user.click(screen.getByRole('button', { name: 'Di luar' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('mengosongkan kata kunci setiap kali daftar dibuka ulang', async () => {
    const user = userEvent.setup();
    render(<ProjectPicker />);

    await bukaDaftar(user);
    await user.type(screen.getByRole('combobox'), 'portal');
    await user.keyboard('{Escape}');
    await bukaDaftar(user);

    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });
});
