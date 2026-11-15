import type { ReadinessSummary } from '@rtl/shared';

/**
 * Ringkasan kesiapan rilis.
 *
 * SEMENTARA. Diganti oleh endpoint `GET /projects/:id/overview` pada [F01-T15].
 * Daftar butirnya sendiri datang dari endpoint terpisah dan dipakai panel
 * kekurangan rilis di [F01-T06].
 */
export const mockReadiness: ReadinessSummary = {
  totalItems: 12,
  incompleteItems: 4,
};
