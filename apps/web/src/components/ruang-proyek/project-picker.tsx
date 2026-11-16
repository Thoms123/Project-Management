'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { mockProjectOptions, type ProjectOption } from '@/lib/mock/projects';
import { cariProyek } from '@/lib/project-search';
import { cn } from '@/lib/utils';

interface ProjectPickerProps {
  options?: ProjectOption[];
  selectedId?: string;
  onSelect?: (option: ProjectOption) => void;
}

/**
 * Pemilih proyek dengan pencarian.
 *
 * Mengikuti pola combobox ARIA: tombol pemicu menampilkan pilihan saat ini,
 * dan daftar hasil muncul bersama kolom pencarian. Fokus dipindah ke kolom
 * pencarian begitu daftar terbuka supaya pengguna bisa langsung mengetik.
 *
 * Pilihan disimpan di sini dulu. Menyalurkannya ke seluruh halaman adalah
 * [F01-T09], dan mengingatnya antar kunjungan adalah [F01-T10].
 */
export function ProjectPicker({
  options = mockProjectOptions,
  selectedId,
  onSelect,
}: ProjectPickerProps) {
  const [terbuka, setTerbuka] = useState(false);
  const [kataKunci, setKataKunci] = useState('');
  const [sorotIndex, setSorotIndex] = useState(0);
  const [pilihanLokal, setPilihanLokal] = useState(options[0]);

  const wadahRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const terpilih = selectedId
    ? (options.find((o) => o.project.id === selectedId) ?? options[0])
    : pilihanLokal;

  const hasil = cariProyek(options, kataKunci);

  // Menutup saat klik di luar. Tanpa ini daftar menggantung terbuka dan
  // menutupi navigasi di bawahnya.
  useEffect(() => {
    if (!terbuka) return;

    function onPointerDown(event: PointerEvent) {
      if (!wadahRef.current?.contains(event.target as Node)) setTerbuka(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [terbuka]);

  useEffect(() => {
    if (terbuka) inputRef.current?.focus();
  }, [terbuka]);

  function buka() {
    setKataKunci('');
    setSorotIndex(0);
    setTerbuka(true);
  }

  function pilih(option: ProjectOption) {
    setPilihanLokal(option);
    onSelect?.(option);
    setTerbuka(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setTerbuka(false);
      return;
    }
    if (hasil.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSorotIndex((i) => (i + 1) % hasil.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSorotIndex((i) => (i === 0 ? hasil.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = hasil[sorotIndex];
      if (target) pilih(target);
    }
  }

  if (!terpilih) return null;

  return (
    <div ref={wadahRef} className="relative">
      <button
        type="button"
        onClick={() => (terbuka ? setTerbuka(false) : buka())}
        aria-haspopup="listbox"
        aria-expanded={terbuka}
        aria-label={`Proyek aktif: ${terpilih.project.name}. Pilih proyek lain`}
        className="flex w-full items-center gap-2 rounded-nested border border-border-subtle p-3 text-left transition-colors hover:bg-surface-subtle"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            {terpilih.company.name}
          </span>
          <span className="mt-0.5 block truncate text-sm font-bold text-text-display">
            {terpilih.project.name}
          </span>
        </span>
        <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-text-muted" />
      </button>

      {terbuka && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-nested border border-border-subtle bg-surface p-2 shadow-surface-active">
          <div className="flex items-center gap-2 rounded-nested bg-surface-subtle px-2.5">
            <Search aria-hidden className="size-4 shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={hasil[sorotIndex] ? `${listboxId}-${hasil[sorotIndex].project.id}` : undefined}
              aria-label="Cari proyek"
              placeholder="Cari proyek…"
              value={kataKunci}
              onChange={(e) => {
                setKataKunci(e.target.value);
                setSorotIndex(0);
              }}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent py-2 text-sm text-text-display outline-none placeholder:text-text-muted"
            />
          </div>

          {hasil.length === 0 ? (
            <p className="px-3 py-4 text-sm text-text-muted">
              Tidak ada proyek yang cocok dengan “{kataKunci.trim()}”.
            </p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Hasil pencarian proyek" className="mt-1 max-h-64 overflow-y-auto">
              {hasil.map((option, index) => {
                const aktif = option.project.id === terpilih.project.id;
                return (
                  // Elemen option itu sendiri yang menangani klik. Menyisipkan
                  // <button> di dalamnya membuat ARIA tidak sah — option tidak
                  // boleh memuat elemen interaktif — dan kliknya tidak sampai
                  // ke handler.
                  <li
                    key={option.project.id}
                    id={`${listboxId}-${option.project.id}`}
                    role="option"
                    aria-selected={aktif}
                    onClick={() => pilih(option)}
                    onMouseEnter={() => setSorotIndex(index)}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-nested px-3 py-2",
                      index === sorotIndex ? "bg-brand-soft" : "hover:bg-surface-subtle",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-display">
                        {option.project.name}
                      </span>
                      <span className="block truncate text-xs text-text-muted">
                        {option.company.name}
                      </span>
                    </span>
                    {aktif && <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
