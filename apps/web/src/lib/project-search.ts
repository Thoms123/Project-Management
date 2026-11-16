import type { ProjectOption } from '@/lib/mock/projects';

/**
 * Menyaring proyek berdasarkan kata kunci.
 *
 * Nama perusahaan ikut dicocokkan: pengguna yang mengetik "Maju" biasanya
 * bermaksud mencari proyek milik perusahaan itu, bukan tidak menemukan apa pun.
 *
 * Pencocokan mengabaikan huruf besar-kecil dan spasi berlebih di tepi; selain
 * itu sederhana saja — pencarian ini hanya menyaring daftar pendek.
 */
export function cariProyek(options: ProjectOption[], keyword: string): ProjectOption[] {
  const kata = keyword.trim().toLowerCase();
  if (!kata) return options;

  return options.filter(
    ({ project, company }) =>
      project.name.toLowerCase().includes(kata) || company.name.toLowerCase().includes(kata),
  );
}
