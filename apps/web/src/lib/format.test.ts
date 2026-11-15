import { describe, expect, it } from 'vitest';
import { formatTanggal, sisaHari } from './format';

describe('formatTanggal', () => {
  it('memformat tanggal ISO ke gaya Indonesia yang ringkas', () => {
    expect(formatTanggal('2026-02-12')).toBe('12 Feb 2026');
  });

  it('mengembalikan null untuk nilai kosong atau tidak sah', () => {
    expect(formatTanggal(null)).toBeNull();
    expect(formatTanggal(undefined)).toBeNull();
    expect(formatTanggal('')).toBeNull();
    expect(formatTanggal('bukan-tanggal')).toBeNull();
  });
});

describe('sisaHari', () => {
  // Dihitung pada batas hari UTC, bukan selisih milidetik — kalau tidak,
  // hasilnya berubah tergantung jam berapa halaman dibuka.
  const now = new Date('2026-11-05T23:30:00Z');

  it('menghitung hari menuju tenggat', () => {
    expect(sisaHari('2026-11-08', now)).toBe(3);
  });

  it('memberi 0 untuk tenggat hari ini, berapa pun jamnya', () => {
    expect(sisaHari('2026-11-05', now)).toBe(0);
    expect(sisaHari('2026-11-05', new Date('2026-11-05T00:01:00Z'))).toBe(0);
  });

  it('memberi nilai negatif untuk tenggat yang sudah lewat', () => {
    expect(sisaHari('2026-11-01', now)).toBe(-4);
  });

  it('mengembalikan null bila tenggat belum ditentukan', () => {
    expect(sisaHari(null, now)).toBeNull();
  });
});
