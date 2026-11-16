import type { Company, Project } from '@rtl/shared';

/**
 * Daftar proyek yang bisa dipilih.
 *
 * SEMENTARA. Diganti oleh endpoint pencarian proyek pada [F01-T16].
 *
 * Dibuat lintas dua perusahaan supaya pemilihnya terbukti menampilkan konteks
 * perusahaan, bukan hanya nama proyek — dua proyek bernama mirip di
 * perusahaan berbeda adalah hal yang biasa terjadi.
 */
export interface ProjectOption {
  project: Pick<Project, 'id' | 'name' | 'description'>;
  company: Pick<Company, 'id' | 'name'>;
}

const nusantara = { id: 'c-1', name: 'PT Teknologi Nusantara' };
const maju = { id: 'c-2', name: 'PT Teknologi Maju' };

export const mockProjectOptions: ProjectOption[] = [
  {
    company: nusantara,
    project: {
      id: 'p-1',
      name: 'Payment Gateway V2',
      description: 'Integrasi pembayaran lintas bank untuk kanal merchant.',
    },
  },
  {
    company: nusantara,
    project: {
      id: 'p-2',
      name: 'Portal Merchant',
      description: 'Dasbor mandiri untuk mitra merchant.',
    },
  },
  {
    company: nusantara,
    project: {
      id: 'p-3',
      name: 'Layanan Notifikasi',
      description: 'Pengiriman notifikasi transaksi lintas kanal.',
    },
  },
  {
    company: maju,
    project: {
      id: 'p-4',
      name: 'Payment Gateway Lama',
      description: 'Pemeliharaan gerbang pembayaran generasi pertama.',
    },
  },
  {
    company: maju,
    project: {
      id: 'p-5',
      name: 'Aplikasi Absensi',
      description: 'Pencatatan kehadiran karyawan berbasis lokasi.',
    },
  },
];
