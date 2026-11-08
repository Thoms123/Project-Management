# Rilis Tanpa Lupa

Aplikasi web manajemen proyek yang mengumpulkan **seluruh kebutuhan rilis dalam satu tempat** — rencana, tugas, variabel environment, catatan database, masalah teknis, dan dokumen rilis.

## Masalah yang diselesaikan

Proses dari perencanaan sampai rilis ke production biasanya tidak tercatat rapi di satu tempat. Akibatnya banyak hal penting terlewat: mencari-cari nama variabel environment, mengingat query database yang dibutuhkan, atau lupa dokumen wajib seperti SDD dan hasil pentest — yang ujungnya memaksa aplikasi di-deploy ulang. Semua "printilan" kecil ini tersebar di banyak tempat dan mudah hilang.

## Tujuan

Satu tempat yang menyatukan tiga tahap proyek:

| Tahap | Isi |
| --- | --- |
| **Plan** | Dokumen PRD, tautan desain, mind map sprint, catatan rencana |
| **Dev** | Papan tugas, cabang fitur/tugas, daftar env & database, catatan masalah teknis |
| **Release** | Dokumen rilis, checklist kelengkapan, **ekspor rangkuman lengkap** dalam satu dokumen |

Hasil akhirnya: saat hendak merilis ke production, semua yang dibutuhkan sudah tercatat, terhubung, dan tercetak dalam satu rangkuman — tidak ada lagi deploy ulang karena kelupaan.

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 |
| Backend | NestJS 12 |
| Database | PostgreSQL 16 + Prisma 7 |
| Autentikasi | JWT / NestJS Auth *(belum dikerjakan — Fase 4)* |
| Penyimpanan file | Object storage *(belum dikerjakan — Fase 1/3)* |
| Deployment | Vercel (frontend), backend terpisah |
| Monorepo | pnpm workspaces + Turborepo |
| Test | Vitest |

```
apps/
  web/      → Next.js (frontend)
  api/      → NestJS + Prisma (backend)
packages/
  shared/   → tipe data & utilitas bersama
```

Dua catatan versi yang gampang menjebak:

- **NestJS 12 ESM-only.** `apps/api` memakai `"type": "module"` dan `moduleResolution: nodenext`, jadi **impor relatif wajib berakhiran `.js`** (mis. `./health.service.js`) meski berkas aslinya `.ts`. Test memakai Vitest + SWC, bukan Jest, karena transformer bawaan Vitest tidak memancarkan metadata dekorator yang dibutuhkan dependency injection NestJS.
- **Prisma 7 tidak lagi menerima `url` di `schema.prisma`.** URL untuk perintah CLI ada di `apps/api/prisma.config.ts`; saat runtime koneksi dibuat lewat driver adapter `@prisma/adapter-pg` di `prisma.service.ts`.

TypeScript dikunci di **6.0.3** — TypeScript 7 belum didukung `typescript-eslint` (`<6.1.0`).

## Roadmap

Pengembangan dibagi 4 fase, 8 fitur, **113 task**.

| Fase | Fitur | Task |
| --- | --- | --- |
| **1 — Pondasi Proyek** | Ruang Proyek · Papan Tugas & Cabang · Rencana Proyek | 46 |
| **2 — Kesiapan Teknis** | Lini Masa Proyek · Daftar Rahasia · Catatan Masalah Teknis | 37 |
| **3 — Rilis & Ekspor** | Dokumen Rilis & Ekspor | 16 |
| **4 — Akun & Kolaborasi** | Masuk & Pengaturan Akun | 14 |

Dibagi per lapisan: **57 task frontend**, **56 task backend**.

Sumber tunggalnya ada di [`.github/roadmap.yml`](.github/roadmap.yml) — lengkap dengan kriteria "selesai bila" untuk setiap fitur dan sub-fitur. Backlog ini disinkronkan ke GitHub Issues dan Project board lewat workflow di bawah.

> PRD lengkap dan mockup desain dipegang privat di lokal (repositori ini publik). `roadmap.yml` memuat ringkasan task dan kriteria selesainya saja.

## Workflow

### Roadmap Sync

Mengubah `roadmap.yml` menjadi **1 Epic Issue per fitur** + **1 Task Issue per task** yang tertaut sebagai *sub-issue* native, lalu menaruh semuanya di Project board dengan field `Fase`, `Fitur`, `Area`, dan `Tipe` terisi.

Dijalankan manual dari tab **Actions → Roadmap Sync**, atau:

```bash
# Lihat rencananya dulu — tidak membuat apa pun
gh workflow run roadmap-sync.yml -f dry_run=true -f phase=all

# Jalankan sebenarnya, satu fase per run
gh workflow run roadmap-sync.yml -f dry_run=false -f phase=1
```

| Input | Default | Keterangan |
| --- | --- | --- |
| `dry_run` | `true` | Hanya menampilkan rencana |
| `phase` | `1` | `1`–`4` atau `all` |
| `skip_project_board` | `false` | Hanya buat Issue, lewati board |

**Jalankan satu fase per run.** GitHub membatasi ~80 pembuatan konten per menit dan 500 per jam; satu run `all` menembus batas itu dan akan terhenti di tengah. Sinkronisasinya idempoten — Issue dikenali lewat marker `<!-- roadmap-key: ... -->` di body-nya — jadi run yang terputus bisa diulang dan hanya melanjutkan sisanya.

#### Mengaktifkan Project board

`GITHUB_TOKEN` bawaan Actions bisa membuat Issue, label, dan sub-issue, tapi **tidak punya akses Projects v2**. Tanpa setup tambahan, workflow tetap berjalan dan hanya melewati bagian board.

Untuk mengaktifkannya, buat [fine-grained PAT](https://github.com/settings/personal-access-tokens/new):

- **Repository access** — hanya repositori ini
- **Repository permissions** — `Issues: Read and write`, `Contents: Read-only`
- **Account permissions** — `Projects: Read and write`

Lalu simpan sebagai secret:

```bash
gh secret set PROJECT_TOKEN
```

### CI

Jalan pada setiap push dan PR ke `main`:

- **`detect`** — memeriksa struktur monorepo
- **`web`** / **`api`** — lint → typecheck → test → build. Job `api` mendapat service PostgreSQL 16 dan menjalankan `prisma migrate deploy`, sehingga migrasi yang di-commit ikut diuji pada database kosong
- **`roadmap-manifest`** — memvalidasi `roadmap.yml` agar manifest rusak tidak pernah ter-merge
- **`ci-ok`** — gerbang tunggal untuk branch protection; pasang job ini sebagai required status check

## Pengembangan lokal

Butuh **Node 20+**, **pnpm 10**, dan **Docker**.

```bash
pnpm install          # prisma generate jalan otomatis lewat postinstall
cp .env.example .env

pnpm db:up            # PostgreSQL 16 di localhost:5433
pnpm db:migrate       # terapkan migrasi

pnpm dev              # web → :3000, api → :3001/api
```

Cek API hidup:

```bash
curl http://localhost:3001/api/health
# {"status":"ok","database":"ok","uptimeSeconds":2}
```

> Port host-nya **5433**, bukan 5432, supaya tidak bentrok dengan PostgreSQL lain yang mungkin sudah jalan di mesinmu. Di dalam container tetap 5432.

### Perintah

| Perintah | Kegunaan |
| --- | --- |
| `pnpm dev` | Jalankan web + api bersamaan |
| `pnpm lint` / `typecheck` / `test` / `build` | Sama persis dengan yang dijalankan CI |
| `pnpm db:up` / `db:down` | Nyalakan / matikan PostgreSQL |
| `pnpm db:migrate` | Buat & terapkan migrasi |
| `pnpm db:studio` | Prisma Studio |

### Tooling roadmap

```bash
cd .github/scripts
npm ci

# Validasi manifest tanpa menyentuh GitHub API
node sync-roadmap.mjs --validate-only

# Lihat Issue yang akan dihasilkan untuk satu key — juga tanpa API
node sync-roadmap.mjs --preview=F04
node sync-roadmap.mjs --preview=F04-T04
```

## Lisensi

Belum ditentukan.
