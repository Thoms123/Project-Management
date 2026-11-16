import { describe, expect, it } from 'vitest';
import { cariProyek } from './project-search';
import { mockProjectOptions } from './mock/projects';

describe('cariProyek', () => {
  it('mengembalikan semua proyek saat kata kunci kosong', () => {
    expect(cariProyek(mockProjectOptions, '')).toHaveLength(mockProjectOptions.length);
    expect(cariProyek(mockProjectOptions, '   ')).toHaveLength(mockProjectOptions.length);
  });

  it('menyaring berdasarkan nama proyek', () => {
    const hasil = cariProyek(mockProjectOptions, 'portal');
    expect(hasil.map((h) => h.project.name)).toEqual(['Portal Merchant']);
  });

  it('mengabaikan huruf besar-kecil', () => {
    expect(cariProyek(mockProjectOptions, 'PORTAL')).toHaveLength(1);
  });

  // Mengetik nama perusahaan biasanya berarti mencari proyek miliknya,
  // bukan tidak menemukan apa pun.
  it('ikut mencocokkan nama perusahaan', () => {
    const hasil = cariProyek(mockProjectOptions, 'Maju');
    expect(hasil.map((h) => h.project.name)).toEqual([
      'Payment Gateway Lama',
      'Aplikasi Absensi',
    ]);
  });

  it('mengembalikan daftar kosong saat tidak ada yang cocok', () => {
    expect(cariProyek(mockProjectOptions, 'zzz')).toEqual([]);
  });

  // Dua proyek bernama mirip di perusahaan berbeda adalah hal biasa.
  it('mengembalikan semua yang cocok, bukan hanya yang pertama', () => {
    const hasil = cariProyek(mockProjectOptions, 'payment gateway');
    expect(hasil).toHaveLength(2);
  });
});
