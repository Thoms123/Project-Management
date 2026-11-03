/**
 * Memuat dan memvalidasi .github/roadmap.yml.
 *
 * Validasi dijalankan SEBELUM ada panggilan API apa pun, supaya manifest yang
 * salah gagal cepat dan tidak meninggalkan Issue setengah jadi di GitHub.
 */

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

export class ManifestError extends Error {
  constructor(problems) {
    super(`Manifest tidak valid (${problems.length} masalah):\n` + problems.map((p) => `  - ${p}`).join('\n'));
    this.name = 'ManifestError';
    this.problems = problems;
  }
}

/** Mengubah teks jadi slug aman untuk nama label. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function loadManifest(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new ManifestError([`Tidak bisa membaca ${path}: ${err.message}`]);
  }

  let doc;
  try {
    doc = yaml.load(raw);
  } catch (err) {
    throw new ManifestError([`YAML tidak bisa di-parse: ${err.message}`]);
  }

  if (!doc || typeof doc !== 'object') {
    throw new ManifestError(['Manifest kosong atau bukan objek YAML.']);
  }

  const problems = [];

  // --- project ------------------------------------------------------------
  const project = doc.project ?? {};
  for (const field of ['title', 'owner', 'repo']) {
    if (!project[field]) problems.push(`project.${field} wajib diisi.`);
  }
  if (project.repo && !/^[\w.-]+\/[\w.-]+$/.test(project.repo)) {
    problems.push(`project.repo harus berformat "owner/repo", dapat "${project.repo}".`);
  }

  // --- phases -------------------------------------------------------------
  const phases = new Map();
  if (!Array.isArray(doc.phases) || doc.phases.length === 0) {
    problems.push('phases wajib berupa list dan tidak boleh kosong.');
  } else {
    for (const phase of doc.phases) {
      if (phase?.id === undefined || phase?.id === null) {
        problems.push('Ada phase tanpa id.');
        continue;
      }
      if (phases.has(phase.id)) problems.push(`phase id ${phase.id} dipakai lebih dari sekali.`);
      if (!phase.name) problems.push(`phase ${phase.id} tidak punya name.`);
      phases.set(phase.id, { id: phase.id, name: phase.name, color: phase.color ?? '0E8A16' });
    }
  }

  // --- areas --------------------------------------------------------------
  const areas = new Map();
  for (const [key, cfg] of Object.entries(doc.areas ?? {})) {
    if (!cfg?.label) problems.push(`areas.${key}.label wajib diisi.`);
    areas.set(key, {
      key,
      label: cfg?.label,
      color: cfg?.color ?? 'EDEDED',
      name: cfg?.name ?? key,
    });
  }
  if (areas.size === 0) problems.push('areas wajib berisi minimal satu entri.');

  // --- epics & tasks ------------------------------------------------------
  const epicKeys = new Set();
  const taskKeys = new Map(); // key -> epicKey, untuk pesan error yang berguna
  const epics = [];

  if (!Array.isArray(doc.epics) || doc.epics.length === 0) {
    problems.push('epics wajib berupa list dan tidak boleh kosong.');
  }

  for (const epic of doc.epics ?? []) {
    const where = `epic ${epic?.key ?? '(tanpa key)'}`;

    if (!epic?.key) {
      problems.push('Ada epic tanpa key.');
      continue;
    }
    if (epicKeys.has(epic.key)) problems.push(`${where}: key duplikat.`);
    epicKeys.add(epic.key);

    if (!epic.title) problems.push(`${where}: title wajib diisi.`);
    if (!phases.has(epic.phase)) {
      problems.push(`${where}: phase ${epic.phase} tidak ada di daftar phases.`);
    }

    const subfeatures = new Map();
    for (const sub of epic.subfeatures ?? []) {
      if (!sub?.key) {
        problems.push(`${where}: ada subfeature tanpa key.`);
        continue;
      }
      if (subfeatures.has(sub.key)) problems.push(`${where}: subfeature ${sub.key} duplikat.`);
      subfeatures.set(sub.key, {
        key: sub.key,
        title: sub.title,
        summary: sub.summary,
        goal: sub.goal,
        done_when: sub.done_when ?? [],
      });
    }

    const tasks = [];
    if (!Array.isArray(epic.tasks) || epic.tasks.length === 0) {
      problems.push(`${where}: tasks kosong.`);
    }
    for (const task of epic.tasks ?? []) {
      if (!task?.key) {
        problems.push(`${where}: ada task tanpa key.`);
        continue;
      }
      if (taskKeys.has(task.key)) {
        problems.push(`task key ${task.key} duplikat (juga dipakai di epic ${taskKeys.get(task.key)}).`);
      }
      taskKeys.set(task.key, epic.key);

      // Key task harus berprefiks key epic-nya. Ini menjaga agar task tidak
      // nyasar ke epic lain saat manifest diedit manual.
      if (!task.key.startsWith(`${epic.key}-`)) {
        problems.push(`task ${task.key} harus berprefiks "${epic.key}-".`);
      }
      if (!task.title) problems.push(`task ${task.key}: title wajib diisi.`);
      if (!areas.has(task.area)) {
        problems.push(`task ${task.key}: area "${task.area}" tidak dikenal (pilihan: ${[...areas.keys()].join(', ')}).`);
      }
      if (task.subfeature && !subfeatures.has(task.subfeature)) {
        problems.push(`task ${task.key}: subfeature "${task.subfeature}" tidak ada di ${where}.`);
      }

      tasks.push({
        key: task.key,
        title: task.title,
        area: task.area,
        subfeature: task.subfeature ?? null,
      });
    }

    epics.push({
      key: epic.key,
      title: epic.title,
      slug: epic.slug ?? slugify(epic.title ?? epic.key),
      phase: epic.phase,
      summary: epic.summary ?? '',
      goal: epic.goal ?? '',
      done_when: epic.done_when ?? [],
      subfeatures,
      tasks,
    });
  }

  if (problems.length > 0) throw new ManifestError(problems);

  const byPhase = {};
  const byArea = {};
  for (const epic of epics) {
    byPhase[epic.phase] = (byPhase[epic.phase] ?? 0) + epic.tasks.length;
    for (const task of epic.tasks) byArea[task.area] = (byArea[task.area] ?? 0) + 1;
  }

  return {
    project,
    phases,
    areas,
    epics,
    stats: {
      epics: epics.length,
      tasks: taskKeys.size,
      issues: epics.length + taskKeys.size,
      byPhase,
      byArea,
    },
  };
}

/** Menyaring manifest ke satu fase saja. Mengembalikan objek bentuk sama. */
export function filterByPhase(manifest, phase) {
  if (phase === 'all' || phase === undefined || phase === null) return manifest;

  const wanted = Number(phase);
  const epics = manifest.epics.filter((e) => Number(e.phase) === wanted);

  const byPhase = {};
  const byArea = {};
  let tasks = 0;
  for (const epic of epics) {
    byPhase[epic.phase] = (byPhase[epic.phase] ?? 0) + epic.tasks.length;
    tasks += epic.tasks.length;
    for (const task of epic.tasks) byArea[task.area] = (byArea[task.area] ?? 0) + 1;
  }

  return {
    ...manifest,
    epics,
    stats: { epics: epics.length, tasks, issues: epics.length + tasks, byPhase, byArea },
  };
}
