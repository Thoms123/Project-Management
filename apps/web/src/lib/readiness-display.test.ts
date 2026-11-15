import { describe, expect, it } from 'vitest';
import { kalimatKesiapan, statusKesiapan } from './readiness-display';

describe('statusKesiapan', () => {
  it('menyatakan siap saat semua butir lengkap', () => {
    expect(statusKesiapan({ totalItems: 12, incompleteItems: 0 })).toBe('siap');
  });

  it('menyatakan ada kekurangan saat masih ada butir tersisa', () => {
    expect(statusKesiapan({ totalItems: 12, incompleteItems: 4 })).toBe('ada_kekurangan');
  });

  // Proyek kosong bukan proyek yang siap dirilis. Tanpa pemisahan ini,
  // proyek yang belum diisi apa pun akan dinyatakan "siap dirilis".
  it('membedakan belum diperiksa dari siap', () => {
    expect(statusKesiapan({ totalItems: 0, incompleteItems: 0 })).toBe('belum_diperiksa');
  });
});

describe('kalimatKesiapan', () => {
  it('menyebut jumlah butir yang belum lengkap', () => {
    const { title } = kalimatKesiapan({ totalItems: 12, incompleteItems: 4 });
    expect(title).toBe('4 hal belum lengkap');
  });

  it('menghitung butir yang sudah beres', () => {
    const { description } = kalimatKesiapan({ totalItems: 12, incompleteItems: 4 });
    expect(description).toBe('8 dari 12 butir kesiapan sudah beres.');
  });

  it('memberi pesan jelas saat proyek siap dirilis', () => {
    const { title, description } = kalimatKesiapan({ totalItems: 12, incompleteItems: 0 });
    expect(title).toBe('Siap dirilis');
    expect(description).toMatch(/12 butir/);
  });

  it('mengarahkan apa yang harus diisi saat belum ada yang diperiksa', () => {
    const { title, description } = kalimatKesiapan({ totalItems: 0, incompleteItems: 0 });
    expect(title).toBe('Belum ada yang diperiksa');
    expect(description).toMatch(/Isi rencana/);
  });
});
