import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Menggabungkan class Tailwind dengan aman: clsx menangani nilai kondisional,
 * twMerge membuang utility yang saling bertabrakan (mis. `p-2 p-4` → `p-4`).
 * Konvensi yang sama dipakai shadcn/ui.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
