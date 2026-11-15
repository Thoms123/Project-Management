# Alur kerja

## Model branch

```
main
 └── feature/F01-ruang-proyek          ← satu branch per epic/fitur
      ├── task/F01-T01-bangun-halaman-utama-ruang-proyek
      ├── task/F01-T02-buat-kartu-ringkasan-status-proyek
      └── …                             ← satu branch per task
```

Pengerjaan selalu terjadi di **branch task**. PR dibuka dari branch task ke **branch fitur induknya**, bukan ke `main`. Setelah seluruh task sebuah fitur selesai, branch fitur baru di-PR ke `main`.

| Branch | Dibuat dari | Di-PR ke |
| --- | --- | --- |
| `feature/<EPIC>-<slug>` | `main` | `main` (setelah semua task selesai) |
| `task/<TASK-KEY>-<slug>` | branch fitur induk | branch fitur induk |

## Penamaan

Nama branch diturunkan dari key di [`.github/roadmap.yml`](.github/roadmap.yml) — key yang sama juga muncul di judul Issue (`[F01-T01] …`) dan di marker body-nya. Satu key mengikat manifest, Issue, branch, dan PR, sehingga semuanya bisa dilacak tanpa pencocokan manual.

```
feature/F01-ruang-proyek
task/F01-T01-bangun-halaman-utama-ruang-proyek
```

Nama branch task juga yang nantinya diisikan ke kolom `feature_branch` dan `task_branch` pada tabel `tasks` — fitur yang dibangun aplikasi ini sendiri (F02 — Papan Tugas & Cabang).

### Buat branch dengan helper

Mengetik nama sepanjang itu manual gampang keliru, dan satu typo memutus keterlacakannya. Pakai helper:

```bash
# Branch fitur dari main
pnpm branch F01

# Branch task dari branch fitur induknya (dibuat dulu bila belum ada)
pnpm branch F01-T01
```

Helper membaca `roadmap.yml`, menyusun namanya, memastikan induknya benar, lalu checkout. Untuk melihat nama tanpa membuat apa pun:

```bash
pnpm branch F01-T01 --dry-run
```

## Langkah pengerjaan satu task

```bash
pnpm branch F01-T01            # buat & pindah ke branch task
# … kerjakan …

pnpm lint && pnpm typecheck && pnpm test && pnpm build

git add -A
git commit            # pesan commit: lihat bagian di bawah
git push -u origin HEAD

gh pr create --fill --base feature/F01-ruang-proyek
```

Setelah PR hijau dan di-merge, lanjut ke task berikutnya dari branch fitur yang sama.

## Proteksi branch

`main` dan `feature/**` dikunci oleh ruleset:

- Perubahan wajib lewat pull request — push langsung ditolak
- Job **`CI OK`** wajib hijau sebelum merge
- Force-push dan penghapusan branch ditolak

Review tidak diwajibkan (proyek satu orang), tapi PR tetap wajib supaya setiap perubahan punya jejak dan selalu melewati CI.

Branch `task/**` **tidak** diproteksi — bebas di-push dan di-force-push selama masih dikerjakan.

## CI

Berjalan pada setiap push dan PR ke `main` maupun `feature/**`:

| Job | Isi |
| --- | --- |
| `Deteksi workspace` | Memeriksa struktur monorepo |
| `Web (Next.js)` | lint → typecheck → test → build |
| `API (NestJS)` | `prisma migrate deploy` ke PostgreSQL 16, lalu lint → typecheck → test → build |
| `Validasi roadmap.yml` | Menjaga manifest tidak rusak |
| `CI OK` | Gerbang tunggal — inilah yang dipakai ruleset |

Task dijalankan lewat `turbo run`, bukan `pnpm run` langsung, supaya `@rtl/shared` dibangun lebih dulu.

## Pesan commit

Tulis dalam bahasa Indonesia. Baris pertama menjelaskan **apa yang berubah**, bukan nama task-nya. Badan pesan menjelaskan **kenapa** — konteks yang tidak terbaca dari diff.

```
Tampilkan kartu ringkasan status proyek

Pengguna harus membuka tiga halaman berbeda untuk tahu kondisi satu
proyek. Kartu ini menyatukan jumlah dokumen rencana, tugas per status,
dan dokumen rilis dalam satu pandangan.

Angka dibulatkan di backend, bukan di komponen, supaya ekspor rangkuman
rilis nanti memakai hitungan yang sama persis.
```

Jangan menutup Issue lewat kata kunci di commit. PR task menuju branch fitur, sehingga `Closes #4` baru benar-benar menutup Issue saat fitur di-merge ke `main` — jauh setelah task-nya sebenarnya selesai. Tutup Issue-nya manual, atau sebutkan dengan `Ref #4`.

## Menjaga branch fitur tetap segar

Branch fitur berumur panjang — F01 saja punya 19 task. Sesekali tarik `main` ke dalamnya agar tidak menumpuk konflik:

```bash
git checkout feature/F01-ruang-proyek
git merge origin/main
git push
```

> Push ini ditolak ruleset. Lakukan lewat PR `main` → branch fitur, atau sementara nonaktifkan ruleset bila memang perlu cepat.

## Mengubah roadmap

`.github/roadmap.yml` adalah sumber tunggal backlog. Setelah menambah task:

```bash
cd .github/scripts
node sync-roadmap.mjs --validate-only          # wajib lulus, CI juga memeriksanya
node sync-roadmap.mjs --preview=F01-T20        # lihat Issue yang akan dibuat
```

Lalu jalankan workflow **Roadmap Sync** untuk membuat Issue barunya. Sinkronisasinya idempoten — Issue lama dilewati.

**Jangan pernah mengubah `key` yang sudah tersinkron.** Key itulah yang dipakai mengenali Issue yang sudah ada; menggantinya membuat Issue duplikat.
