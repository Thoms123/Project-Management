#!/usr/bin/env node
/**
 * Membuat branch dengan nama yang diturunkan dari .github/roadmap.yml.
 *
 * Nama branch mengikat manifest, Issue, dan PR lewat key yang sama. Mengetiknya
 * manual gampang keliru, dan satu typo memutus keterlacakan itu.
 *
 *   node branch.mjs F01       -> feature/F01-ruang-proyek         (dari main)
 *   node branch.mjs F01-T01   -> task/F01-T01-bangun-halaman-...  (dari branch fitur)
 *   node branch.mjs F01-T01 --dry-run
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST = resolve(HERE, '..', 'roadmap.yml');

/**
 * Dimuat dinamis supaya dependensinya bisa diperiksa.
 *
 * lib/manifest.mjs butuh js-yaml dari .github/scripts/node_modules, yang TIDAK
 * ikut terpasang oleh `pnpm install` di akar — direktori itu paket npm
 * tersendiri. Tanpa penjagaan ini, pemakai pada clone baru hanya melihat
 * "Cannot find package 'js-yaml'" tanpa tahu harus berbuat apa.
 */
async function loadLib() {
  try {
    return await import('./lib/manifest.mjs');
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        'Dependensi tooling roadmap belum terpasang. Jalankan:\n  npm ci --prefix .github/scripts',
      );
    }
    throw err;
  }
}

function git(args, { capture = true } = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })?.trim();
}

function branchExists(name) {
  try {
    git(['rev-parse', '--verify', `refs/heads/${name}`]);
    return true;
  } catch {
    return false;
  }
}

function remoteBranchExists(name) {
  try {
    return git(['ls-remote', '--heads', 'origin', name]).length > 0;
  } catch {
    return false;
  }
}

/** Memetakan key roadmap ke nama branch beserta branch induknya. */
function resolveTarget(manifest, slugify, key) {
  for (const epic of manifest.epics) {
    const featureBranch = `feature/${epic.key}-${epic.slug}`;

    if (epic.key === key) {
      return { kind: 'feature', branch: featureBranch, base: 'main', epic };
    }

    const task = epic.tasks.find((t) => t.key === key);
    if (task) {
      return {
        kind: 'task',
        branch: `task/${task.key}-${slugify(task.title)}`,
        base: featureBranch,
        epic,
        task,
      };
    }
  }

  throw new Error(
    `Key "${key}" tidak ada di roadmap.yml.\n` +
      'Format yang dikenal: F01 (epic) atau F01-T01 (task).',
  );
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const key = args.find((a) => !a.startsWith('--'));

  if (!key) {
    console.error('Pemakaian: pnpm branch <KEY> [--dry-run]\n  contoh: pnpm branch F01-T01');
    process.exit(1);
  }

  const { loadManifest, slugify } = await loadLib();
  const manifest = loadManifest(MANIFEST);
  const target = resolveTarget(manifest, slugify, key);

  console.log(`${target.kind === 'feature' ? 'Branch fitur' : 'Branch task'}: ${target.branch}`);
  console.log(`Dibuat dari : ${target.base}`);
  if (target.task) console.log(`Task        : [${target.task.key}] ${target.task.title}`);

  if (dryRun) {
    console.log('\n(dry run — tidak ada yang dibuat)');
    return;
  }

  // Pekerjaan yang belum di-commit akan ikut terbawa dan mengaburkan branch
  // mana yang sebenarnya memuatnya. Hentikan sebelum itu terjadi.
  if (git(['status', '--porcelain'])) {
    throw new Error('Ada perubahan yang belum di-commit. Commit atau stash dulu.');
  }

  if (branchExists(target.branch)) {
    console.log('\nBranch sudah ada — berpindah ke sana.');
    git(['checkout', target.branch], { capture: false });
    return;
  }

  // Branch fitur induk harus ada lebih dulu, kalau perlu diambil dari remote.
  if (target.kind === 'task' && !branchExists(target.base)) {
    if (remoteBranchExists(target.base)) {
      console.log(`\nMengambil branch fitur ${target.base} dari origin…`);
      git(['fetch', 'origin', `${target.base}:${target.base}`], { capture: false });
    } else {
      throw new Error(
        `Branch fitur "${target.base}" belum ada.\n  Buat dulu: pnpm branch ${target.epic.key}`,
      );
    }
  }

  // Bercabang dari origin/<base> supaya branch baru tidak mewarisi commit
  // lokal yang belum di-push.
  let startPoint = target.base;
  if (remoteBranchExists(target.base)) {
    git(['fetch', 'origin', target.base], { capture: false });
    startPoint = 'FETCH_HEAD';
  }

  console.log(`\nMembuat ${target.branch} dari ${target.base}…`);
  git(['checkout', '-b', target.branch, startPoint], { capture: false });

  console.log('\nSelesai. Setelah commit, push dengan:');
  console.log('  git push -u origin HEAD');
  if (target.kind === 'task') {
    console.log(`  gh pr create --fill --base ${target.base}`);
  }
}

main().catch((err) => {
  // ManifestError sudah membawa daftar masalahnya sendiri; error lain cukup
  // ditampilkan pesannya.
  console.error(err.name === 'ManifestError' ? `\n${err.message}` : `\nGagal: ${err.message}`);
  process.exit(1);
});
