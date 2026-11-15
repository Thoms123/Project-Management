/**
 * Format tanggal yang dipakai seluruh aplikasi: "12 Feb 2026".
 *
 * Locale dan zona waktu dipatok eksplisit, bukan mengikuti mesin. Tanpa itu,
 * server dan browser bisa menghasilkan teks berbeda untuk tanggal yang sama
 * dan React melaporkannya sebagai hydration mismatch.
 */
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatTanggal(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return dateFormatter.format(parsed);
}

/**
 * Selisih hari penuh menuju `target`, dihitung pada batas hari UTC.
 *
 * Negatif berarti sudah lewat. Membandingkan pada batas hari — bukan selisih
 * milidetik — supaya tenggat hari ini selalu bernilai 0, bukan 0 atau -1
 * tergantung jam berapa halaman dibuka.
 */
export function sisaHari(target: string | null | undefined, now: Date = new Date()): number | null {
  if (!target) return null;

  const parsed = new Date(target);
  if (Number.isNaN(parsed.getTime())) return null;

  const MS_PER_DAY = 86_400_000;
  const targetDay = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  return Math.round((targetDay - today) / MS_PER_DAY);
}
