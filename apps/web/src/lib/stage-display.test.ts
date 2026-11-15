import { describe, expect, it } from 'vitest';
import type { StageSummary } from '@rtl/shared';
import { persenTahap, ringkasTahap, tahapKosong } from './stage-display';

const buat = (over: Partial<StageSummary> = {}): StageSummary => ({
  stage: 'dev',
  completed: 5,
  total: 8,
  details: [],
  ...over,
});

describe('tahapKosong', () => {
  it('menganggap tahap tanpa butir sama sekali sebagai belum diisi', () => {
    expect(tahapKosong(buat({ total: 0, completed: 0 }))).toBe(true);
  });

  // Nol dari empat bukan "belum diisi" — butirnya sudah diketahui, tinggal
  // dilengkapi. Membedakan keduanya menentukan pesan yang pantas muncul.
  it('tidak menganggap tahap yang butirnya ada tapi belum lengkap sebagai kosong', () => {
    expect(tahapKosong(buat({ total: 4, completed: 0 }))).toBe(false);
  });
});

describe('ringkasTahap', () => {
  it('menyusun kalimat dengan satuan dan kata kerja tiap tahap', () => {
    expect(ringkasTahap(buat())).toBe('5 dari 8 tugas selesai');
    expect(ringkasTahap(buat({ stage: 'plan', completed: 3, total: 4 }))).toBe(
      '3 dari 4 dokumen rencana terisi',
    );
    expect(ringkasTahap(buat({ stage: 'release', completed: 1, total: 2 }))).toBe(
      '1 dari 2 dokumen rilis lengkap',
    );
  });

  it('mengganti angka dengan keterangan saat tahap belum diisi', () => {
    const teks = ringkasTahap(buat({ stage: 'plan', completed: 0, total: 0 }));
    expect(teks).toMatch(/Rencana belum diisi/);
    expect(teks).not.toMatch(/0 dari 0/);
  });
});

describe('persenTahap', () => {
  it('membulatkan persentase kelengkapan', () => {
    expect(persenTahap(buat({ completed: 5, total: 8 }))).toBe(63);
    expect(persenTahap(buat({ completed: 4, total: 4 }))).toBe(100);
  });

  // Tanpa penjagaan ini hasilnya NaN dan bocor ke atribut aria-valuenow.
  it('mengembalikan nol, bukan NaN, saat total nol', () => {
    expect(persenTahap(buat({ completed: 0, total: 0 }))).toBe(0);
  });
});
