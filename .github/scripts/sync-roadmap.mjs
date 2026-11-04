#!/usr/bin/env node
/**
 * Roadmap Sync — mengubah .github/roadmap.yml menjadi:
 *   - 1 Epic Issue per fitur
 *   - 1 Task Issue per task, tertaut sebagai sub-issue native ke epic-nya
 *   - item di GitHub Project board, dengan field Fase/Fitur/Area/Tipe terisi
 *
 * Idempoten: Issue dikenali lewat marker `<!-- roadmap-key: ... -->` di body,
 * jadi menjalankan ulang tidak membuat duplikat.
 *
 * Pemakaian:
 *   node sync-roadmap.mjs --validate-only
 *   node sync-roadmap.mjs --dry-run --phase=all
 *   node sync-roadmap.mjs --phase=1
 *   node sync-roadmap.mjs --phase=1 --skip-project-board
 *
 * Environment:
 *   GITHUB_TOKEN        wajib — untuk label, Issue, sub-issue
 *   PROJECT_TOKEN       opsional — PAT ber-scope `project` untuk Project board.
 *                       Bila kosong, sinkronisasi board dilewati.
 *   GITHUB_STEP_SUMMARY opsional — bila ada, ringkasan ditulis ke sana juga
 */

import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { loadManifest, filterByPhase, ManifestError } from './lib/manifest.mjs';
import {
  makeRest,
  makeGraphql,
  ensureLabel,
  fetchRoadmapIssues,
  createIssue,
  updateIssue,
  listSubIssues,
  addSubIssue,
  getRepositoryId,
  getOwnerId,
  findProjectByTitle,
  createProject,
  linkProjectToRepository,
  ensureSingleSelectField,
  addProjectItem,
  setSingleSelectValue,
  listProjectItemNumbers,
  listIssueProjectItems,
  recreateProjectItem,
  ensureView,
  markerFor,
  sleep,
  CREATE_DELAY_MS,
} from './lib/github.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MANIFEST = resolve(HERE, '..', 'roadmap.yml');

// Warna opsi single-select Projects v2 dibatasi enum, bukan hex bebas.
const PHASE_OPTION_COLORS = ['BLUE', 'ORANGE', 'GREEN', 'PURPLE'];
const FEATURE_OPTION_COLORS = ['BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'RED', 'PINK', 'PURPLE', 'GRAY'];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    validateOnly: false,
    dryRun: false,
    phase: 'all',
    skipProjectBoard: false,
    preview: null,
    manifest: DEFAULT_MANIFEST,
  };

  for (const arg of argv) {
    if (arg === '--validate-only') opts.validateOnly = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--skip-project-board') opts.skipProjectBoard = true;
    else if (arg.startsWith('--phase=')) opts.phase = arg.slice('--phase='.length);
    else if (arg.startsWith('--preview=')) opts.preview = arg.slice('--preview='.length);
    else if (arg.startsWith('--manifest=')) opts.manifest = resolve(arg.slice('--manifest='.length));
    else throw new Error(`Argumen tidak dikenal: ${arg}`);
  }

  if (opts.phase !== 'all' && !/^[1-9]\d*$/.test(opts.phase)) {
    throw new Error(`--phase harus "all" atau angka, dapat "${opts.phase}".`);
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Penyusun body Issue
// ---------------------------------------------------------------------------

function bulletList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function checkList(items) {
  return items.map((item) => `- [ ] ${item}`).join('\n');
}

function buildEpicBody(epic, phase) {
  const parts = [];

  if (epic.summary) parts.push(`> ${epic.summary}`);
  parts.push(`**Fase ${phase.id} — ${phase.name}** · ${epic.tasks.length} task`);

  if (epic.goal) parts.push(`## Tujuan\n\n${epic.goal}`);
  if (epic.done_when.length > 0) parts.push(`## Selesai bila\n\n${checkList(epic.done_when)}`);

  if (epic.subfeatures.size > 0) {
    const blocks = [];
    for (const sub of epic.subfeatures.values()) {
      const block = [`### ${sub.title}`];
      if (sub.summary) block.push(`${sub.summary}`);
      if (sub.goal) block.push(`**Tujuan** — ${sub.goal}`);
      if (sub.done_when.length > 0) block.push(`**Selesai bila**\n\n${bulletList(sub.done_when)}`);
      blocks.push(block.join('\n\n'));
    }
    parts.push(`## Sub-fitur\n\n${blocks.join('\n\n')}`);
  }

  parts.push(
    '---\n\nDaftar task ada di panel **Sub-issues** di atas. ' +
      'Isi Issue ini dibuat otomatis dari `.github/roadmap.yml` — ' +
      'edit manifest lalu jalankan workflow **Roadmap Sync** untuk memperbaruinya.',
  );
  parts.push(markerFor(epic.key));

  return parts.join('\n\n');
}

function buildTaskBody(task, epic, phase, epicNumber, areaName) {
  const parts = [];

  const epicRef = epicNumber ? `#${epicNumber}` : `\`${epic.key}\``;
  parts.push(
    [
      `**Epic:** ${epicRef} — ${epic.title}`,
      `**Fase:** ${phase.id} — ${phase.name}`,
      `**Area:** ${areaName}`,
    ].join('  \n'),
  );

  const sub = task.subfeature ? epic.subfeatures.get(task.subfeature) : null;

  if (sub) {
    const block = [`## Konteks — ${sub.title}`];
    if (sub.summary) block.push(sub.summary);
    if (sub.goal) block.push(`**Tujuan**\n\n${sub.goal}`);
    if (sub.done_when.length > 0) {
      block.push(`**Kriteria selesai sub-fitur**\n\n${checkList(sub.done_when)}`);
    }
    parts.push(block.join('\n\n'));
  } else {
    const block = [`## Konteks — ${epic.title}`];
    block.push(`Task ini berlaku lintas sub-fitur. Kriteria selesai tingkat fitur ada di epic ${epicRef}.`);
    if (epic.goal) block.push(`**Tujuan fitur**\n\n${epic.goal}`);
    parts.push(block.join('\n\n'));
  }

  parts.push(markerFor(task.key));
  return parts.join('\n\n');
}

/**
 * Menampilkan Issue yang akan dihasilkan untuk satu key, tanpa menyentuh API.
 * Dipakai untuk memeriksa hasil render setelah mengedit manifest.
 */
function previewIssue(manifest, key) {
  for (const epic of manifest.epics) {
    const phase = manifest.phases.get(epic.phase);

    if (epic.key === key) {
      console.log(`\n--- JUDUL ---\n[${epic.key}] ${epic.title}`);
      console.log(`\n--- LABEL ---\n${labelsForEpic(epic).join(', ')}`);
      console.log(`\n--- BODY ---\n${buildEpicBody(epic, phase)}`);
      return;
    }

    const task = epic.tasks.find((t) => t.key === key);
    if (task) {
      const areaName = manifest.areas.get(task.area).name;
      console.log(`\n--- JUDUL ---\n[${task.key}] ${task.title}`);
      console.log(`\n--- LABEL ---\n${labelsForTask(task, epic, manifest).join(', ')}`);
      console.log(`\n--- BODY ---\n${buildTaskBody(task, epic, phase, null, areaName)}`);
      return;
    }
  }

  throw new Error(`Key "${key}" tidak ada di manifest.`);
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

function collectLabels(manifest) {
  const labels = [
    { name: 'epic', color: '6E40C9', description: 'Issue induk satu fitur; task-nya jadi sub-issue' },
  ];

  for (const phase of manifest.phases.values()) {
    labels.push({
      name: `fase-${phase.id}`,
      color: phase.color,
      description: `Fase ${phase.id} — ${phase.name}`,
    });
  }

  for (const epic of manifest.epics) {
    labels.push({
      name: `fitur:${epic.slug}`,
      color: '3559E0',
      description: epic.title,
    });
  }

  for (const area of manifest.areas.values()) {
    labels.push({ name: area.label, color: area.color, description: area.name });
  }

  return labels;
}

function labelsForEpic(epic) {
  return ['epic', `fase-${epic.phase}`, `fitur:${epic.slug}`];
}

function labelsForTask(task, epic, manifest) {
  return [`fase-${epic.phase}`, `fitur:${epic.slug}`, manifest.areas.get(task.area).label];
}

// ---------------------------------------------------------------------------
// Sinkronisasi Issue
// ---------------------------------------------------------------------------

async function syncIssues(rest, owner, repo, manifest, existing, stats, { dryRun }) {
  const epicIssues = new Map(); // epicKey -> issue
  const taskIssues = new Map(); // taskKey -> { issue, epicKey }

  // --- Epic dulu, supaya Task bisa menautkan nomornya di body -------------
  for (const epic of manifest.epics) {
    const phase = manifest.phases.get(epic.phase);
    const title = `[${epic.key}] ${epic.title}`;
    const body = buildEpicBody(epic, phase);
    const labels = labelsForEpic(epic);
    const found = existing.get(epic.key);

    if (found) {
      epicIssues.set(epic.key, found);
      stats.epicsSkipped += 1;
      console.log(`  = epic ${epic.key} sudah ada (#${found.number})`);
      continue;
    }

    if (dryRun) {
      stats.epicsPlanned += 1;
      console.log(`  + epic ${epic.key} akan dibuat — ${title}`);
      continue;
    }

    const issue = await createIssue(rest, owner, repo, { title, body, labels });
    epicIssues.set(epic.key, issue);
    stats.epicsCreated += 1;
    console.log(`  + epic ${epic.key} dibuat (#${issue.number})`);
    await sleep(CREATE_DELAY_MS);
  }

  // --- Task ---------------------------------------------------------------
  for (const epic of manifest.epics) {
    const phase = manifest.phases.get(epic.phase);
    const epicIssue = epicIssues.get(epic.key);

    for (const task of epic.tasks) {
      const found = existing.get(task.key);
      const title = `[${task.key}] ${task.title}`;

      if (found) {
        taskIssues.set(task.key, { issue: found, epicKey: epic.key });
        stats.tasksSkipped += 1;
        continue;
      }

      if (dryRun) {
        stats.tasksPlanned += 1;
        console.log(`  + task ${task.key} akan dibuat — ${title}`);
        continue;
      }

      const areaName = manifest.areas.get(task.area).name;
      const body = buildTaskBody(task, epic, phase, epicIssue?.number, areaName);
      const labels = labelsForTask(task, epic, manifest);

      const issue = await createIssue(rest, owner, repo, { title, body, labels });
      taskIssues.set(task.key, { issue, epicKey: epic.key });
      stats.tasksCreated += 1;
      console.log(`  + task ${task.key} dibuat (#${issue.number})`);
      await sleep(CREATE_DELAY_MS);
    }
  }

  return { epicIssues, taskIssues };
}

async function syncSubIssues(rest, owner, repo, manifest, epicIssues, taskIssues, stats, { dryRun }) {
  for (const epic of manifest.epics) {
    const epicIssue = epicIssues.get(epic.key);

    // Epic belum ada — hanya mungkin saat dry run. Seluruh task-nya pasti
    // perlu ditautkan nanti, jadi hitung semuanya sebagai rencana.
    if (!epicIssue) {
      stats.linksPlanned += epic.tasks.length;
      continue;
    }

    const alreadyLinked = new Set(
      (await listSubIssues(rest, owner, repo, epicIssue.number)).map((s) => s.id),
    );

    for (const task of epic.tasks) {
      const entry = taskIssues.get(task.key);

      // Task Issue-nya belum ada: akan dibuat lalu ditautkan.
      if (!entry) {
        stats.linksPlanned += 1;
        continue;
      }

      if (alreadyLinked.has(entry.issue.id)) {
        stats.linksSkipped += 1;
        continue;
      }

      if (dryRun) {
        stats.linksPlanned += 1;
        continue;
      }

      try {
        // `id`, bukan `number` — lihat catatan di lib/github.mjs
        await addSubIssue(rest, owner, repo, epicIssue.number, entry.issue.id);
        stats.linksCreated += 1;
      } catch (err) {
        stats.linkErrors.push(`${task.key} → ${epic.key}: ${err.message}`);
        console.warn(`  ! gagal menautkan ${task.key} ke ${epic.key}: ${err.message}`);
      }
      await sleep(CREATE_DELAY_MS / 2);
    }
  }
}

// ---------------------------------------------------------------------------
// Project board
// ---------------------------------------------------------------------------

async function syncProjectBoard(gql, manifest, epicIssues, taskIssues, stats) {
  const [owner, repo] = manifest.project.repo.split('/');
  const login = manifest.project.owner;
  const title = manifest.project.title;

  let project = await findProjectByTitle(gql, login, title);
  if (project) {
    console.log(`  = project "${title}" sudah ada (#${project.number})`);
  } else {
    const ownerId = await getOwnerId(gql, login);
    project = await createProject(gql, ownerId, title);
    stats.projectCreated = true;
    console.log(`  + project "${title}" dibuat (#${project.number})`);
  }
  stats.projectUrl = `https://github.com/users/${login}/projects/${project.number}`;

  try {
    const repositoryId = await getRepositoryId(gql, owner, repo);
    await linkProjectToRepository(gql, project.id, repositoryId);
  } catch (err) {
    console.warn(`  ! gagal menautkan project ke repo: ${err.message}`);
  }

  // --- Field --------------------------------------------------------------
  const phaseList = [...manifest.phases.values()];
  const fieldFase = await ensureSingleSelectField(
    gql,
    project.id,
    'Fase',
    phaseList.map((p, i) => ({
      name: `${p.id} — ${p.name}`,
      color: PHASE_OPTION_COLORS[i % PHASE_OPTION_COLORS.length],
      description: `Fase ${p.id}`,
    })),
  );

  const fieldFitur = await ensureSingleSelectField(
    gql,
    project.id,
    'Fitur',
    manifest.epics.map((e, i) => ({
      name: e.title,
      color: FEATURE_OPTION_COLORS[i % FEATURE_OPTION_COLORS.length],
      description: e.key,
    })),
  );

  const fieldArea = await ensureSingleSelectField(
    gql,
    project.id,
    'Area',
    [...manifest.areas.values()].map((a, i) => ({
      name: a.name,
      color: i === 0 ? 'GREEN' : 'YELLOW',
      description: a.key,
    })),
  );

  const fieldTipe = await ensureSingleSelectField(gql, project.id, 'Tipe', [
    { name: 'Epic', color: 'PURPLE', description: 'Issue induk satu fitur' },
    { name: 'Task', color: 'GRAY', description: 'Satu task yang dikerjakan' },
  ]);

  // --- Item ---------------------------------------------------------------
  const queue = [];
  for (const epic of manifest.epics) {
    const issue = epicIssues.get(epic.key);
    if (issue) queue.push({ issue, epic, tipe: 'Epic', area: null });
    for (const task of epic.tasks) {
      const entry = taskIssues.get(task.key);
      if (entry) queue.push({ issue: entry.issue, epic, tipe: 'Task', area: task.area });
    }
  }

  for (const { issue, epic, tipe, area } of queue) {
    try {
      const itemId = await addProjectItem(gql, project.id, issue.node_id);
      const phase = manifest.phases.get(epic.phase);

      const assignments = [
        [fieldFase, `${phase.id} — ${phase.name}`],
        [fieldFitur, epic.title],
        [fieldTipe, tipe],
      ];
      if (area) assignments.push([fieldArea, manifest.areas.get(area).name]);

      for (const [field, optionName] of assignments) {
        const optionId = field.options.get(optionName);
        if (!optionId) {
          console.warn(`  ! opsi "${optionName}" tidak ada di field "${field.name}", dilewati`);
          continue;
        }
        await setSingleSelectValue(gql, project.id, itemId, field.id, optionId);
      }

      stats.projectItems += 1;
    } catch (err) {
      stats.projectErrors.push(`#${issue.number}: ${err.message}`);
      console.warn(`  ! gagal menaruh #${issue.number} di board: ${err.message}`);
    }
  }

  // --- Verifikasi hasil ---------------------------------------------------
  // Jangan percaya pada mutation yang mengembalikan sukses: cocokkan daftar
  // item yang benar-benar terdaftar dengan yang seharusnya ada.
  try {
    const onBoard = await listProjectItemNumbers(gql, project.id);
    const missing = queue.filter(({ issue }) => !onBoard.has(issue.number));

    for (const { issue } of missing) {
      console.warn(`  ! #${issue.number} tidak muncul di board meski penambahan sukses — dibuat ulang`);
      try {
        const items = await listIssueProjectItems(gql, owner, repo, issue.number, project.id);
        if (items.length > 0) {
          await recreateProjectItem(gql, project.id, items[0].id, issue.node_id);
        } else {
          await addProjectItem(gql, project.id, issue.node_id);
        }
        stats.projectRepaired += 1;
      } catch (err) {
        stats.projectErrors.push(`#${issue.number} gagal dipulihkan: ${err.message}`);
      }
    }

    if (missing.length > 0) {
      const after = await listProjectItemNumbers(gql, project.id);
      const stillMissing = queue.filter(({ issue }) => !after.has(issue.number));
      for (const { issue } of stillMissing) {
        stats.projectErrors.push(`#${issue.number} tetap tidak terdaftar di board`);
      }
    }
  } catch (err) {
    console.warn(`  ! verifikasi board gagal: ${err.message}`);
  }

  // --- View ---------------------------------------------------------------
  // Filter pakai label, bukan field kustom: label dijamin ada dan namanya
  // stabil, sedangkan nama opsi field bisa berubah bila manifest diedit.
  try {
    for (const phase of phaseList) {
      await ensureView(gql, project.id, {
        name: `Fase ${phase.id} — ${phase.name}`,
        layout: 'BOARD_LAYOUT',
        filter: `label:"fase-${phase.id}" -label:epic`,
      });
    }
    await ensureView(gql, project.id, {
      name: 'Semua Task',
      layout: 'TABLE_LAYOUT',
      filter: '-label:epic',
    });
    await ensureView(gql, project.id, {
      name: 'Epic',
      layout: 'TABLE_LAYOUT',
      filter: 'label:epic',
    });
    stats.projectViews = phaseList.length + 2;
  } catch (err) {
    console.warn(`  ! gagal menyiapkan view: ${err.message}`);
    stats.projectErrors.push(`view: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Ringkasan
// ---------------------------------------------------------------------------

function buildSummary(manifest, stats, opts) {
  const lines = [];
  const mode = opts.dryRun ? 'Dry run (tidak ada perubahan)' : 'Sinkronisasi';
  const scope = opts.phase === 'all' ? 'Semua fase' : `Fase ${opts.phase}`;

  lines.push(`## Roadmap Sync — ${mode}`);
  lines.push('');
  lines.push(`**Lingkup:** ${scope} · **Manifest:** ${manifest.stats.epics} epic, ${manifest.stats.tasks} task`);
  lines.push('');
  lines.push('| Item | Dibuat | Sudah ada | Direncanakan |');
  lines.push('| --- | --- | --- | --- |');
  lines.push(`| Epic Issue | ${stats.epicsCreated} | ${stats.epicsSkipped} | ${stats.epicsPlanned} |`);
  lines.push(`| Task Issue | ${stats.tasksCreated} | ${stats.tasksSkipped} | ${stats.tasksPlanned} |`);
  lines.push(`| Tautan sub-issue | ${stats.linksCreated} | ${stats.linksSkipped} | ${stats.linksPlanned} |`);
  lines.push('');

  if (stats.projectSkippedReason) {
    lines.push(`> **Project board dilewati** — ${stats.projectSkippedReason}`);
  } else {
    lines.push(`**Project board:** ${stats.projectItems} item disinkronkan, ${stats.projectViews} view disiapkan.`);
    if (stats.projectRepaired > 0) {
      lines.push('');
      lines.push(`> ${stats.projectRepaired} item tidak muncul di board meski penambahannya sukses, lalu dibuat ulang.`);
    }
    if (stats.projectUrl) lines.push('');
    if (stats.projectUrl) lines.push(`[Buka board →](${stats.projectUrl})`);
  }

  const errors = [...stats.linkErrors, ...stats.projectErrors];
  if (errors.length > 0) {
    lines.push('');
    lines.push(`### ${errors.length} masalah`);
    lines.push('');
    lines.push(errors.slice(0, 25).map((e) => `- ${e}`).join('\n'));
    if (errors.length > 25) lines.push(`- …dan ${errors.length - 25} lainnya (lihat log)`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const full = loadManifest(opts.manifest);
  const manifest = filterByPhase(full, opts.phase);

  console.log(`Manifest: ${full.stats.epics} epic, ${full.stats.tasks} task, ${full.phases.size} fase`);
  console.log(
    `  per fase: ${Object.entries(full.stats.byPhase).map(([p, n]) => `fase ${p}=${n}`).join(', ')}`,
  );
  console.log(
    `  per area: ${Object.entries(full.stats.byArea).map(([a, n]) => `${a}=${n}`).join(', ')}`,
  );

  if (opts.validateOnly) {
    console.log('\nManifest valid: 0 key duplikat, 0 referensi tidak sah.');
    return;
  }

  if (opts.preview) {
    previewIssue(full, opts.preview);
    return;
  }

  if (opts.phase !== 'all') {
    console.log(`\nLingkup dibatasi ke fase ${opts.phase}: ${manifest.stats.epics} epic, ${manifest.stats.tasks} task.`);
    if (manifest.stats.epics === 0) {
      throw new Error(`Tidak ada epic di fase ${opts.phase}.`);
    }
  }

  const repoSlug = process.env.GITHUB_REPOSITORY ?? manifest.project.repo;
  const [owner, repo] = repoSlug.split('/');

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN tidak diset.');
  const rest = makeRest(token);

  const stats = {
    epicsCreated: 0, epicsSkipped: 0, epicsPlanned: 0,
    tasksCreated: 0, tasksSkipped: 0, tasksPlanned: 0,
    linksCreated: 0, linksSkipped: 0, linksPlanned: 0,
    linkErrors: [],
    projectItems: 0, projectViews: 0, projectRepaired: 0, projectErrors: [],
    projectCreated: false, projectUrl: null, projectSkippedReason: null,
  };

  console.log(`\nMemindai Issue yang sudah ada di ${owner}/${repo}…`);
  const { byKey: existing, scanned } = await fetchRoadmapIssues(rest, owner, repo);
  console.log(`  ${scanned} Issue dipindai, ${existing.size} di antaranya punya marker roadmap.`);

  if (!opts.dryRun) {
    console.log('\nMenyiapkan label…');
    for (const label of collectLabels(full)) {
      const result = await ensureLabel(rest, owner, repo, label);
      if (result !== 'unchanged') console.log(`  ${result === 'created' ? '+' : '~'} ${label.name}`);
    }
  }

  console.log(`\n${opts.dryRun ? 'Merencanakan' : 'Menyinkronkan'} Issue…`);
  const { epicIssues, taskIssues } = await syncIssues(rest, owner, repo, manifest, existing, stats, opts);

  console.log(`\n${opts.dryRun ? 'Merencanakan' : 'Menautkan'} sub-issue…`);
  await syncSubIssues(rest, owner, repo, manifest, epicIssues, taskIssues, stats, opts);

  if (opts.dryRun) {
    stats.projectSkippedReason = 'dry run';
  } else if (opts.skipProjectBoard) {
    stats.projectSkippedReason = 'diminta lewat input skip_project_board';
  } else if (!process.env.PROJECT_TOKEN) {
    stats.projectSkippedReason =
      'secret PROJECT_TOKEN belum diset. GITHUB_TOKEN tidak punya akses Projects v2 — ' +
      'buat fine-grained PAT dengan izin "Projects: Read and write" lalu simpan sebagai secret PROJECT_TOKEN.';
    console.warn(`\nProject board dilewati: ${stats.projectSkippedReason}`);
  } else {
    console.log('\nMenyinkronkan Project board…');
    const gql = makeGraphql(process.env.PROJECT_TOKEN);
    await syncProjectBoard(gql, manifest, epicIssues, taskIssues, stats);
  }

  const summary = buildSummary(manifest, stats, opts);
  console.log(`\n${'='.repeat(70)}\n${summary}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }

  const errorCount = stats.linkErrors.length + stats.projectErrors.length;
  if (errorCount > 0) {
    console.error(`\n${errorCount} operasi gagal — lihat ringkasan di atas.`);
    process.exitCode = 1;
  }
}

/**
 * Menguraikan error GraphQL jadi pesan yang bisa ditindaklanjuti.
 *
 * `GraphqlResponseError.message` hanya berisi "Request failed due to following
 * response errors:" tanpa rincian bila array `errors`-nya kosong — yang justru
 * terjadi pada kegagalan izin, karena GitHub menaruh sebabnya di `type` dan di
 * header respons, bukan di `message`.
 */
function describeGraphqlError(err) {
  const lines = [];

  for (const e of err.errors ?? []) {
    const type = e.type ? ` [${e.type}]` : '';
    const path = e.path ? ` (${[].concat(e.path).join('.')})` : '';
    lines.push(`  - ${e.message}${type}${path}`);
  }

  const status = err.status ?? err.response?.status;
  if (status) lines.push(`  - HTTP ${status}`);

  const scopes = err.response?.headers?.['x-oauth-scopes'];
  const accepted = err.response?.headers?.['x-accepted-oauth-scopes'];
  if (scopes !== undefined) lines.push(`  - scope token: "${scopes || '(kosong — fine-grained PAT)'}"`);
  if (accepted) lines.push(`  - scope yang diminta: "${accepted}"`);

  if (lines.length === 0 && err.response?.data) {
    lines.push(`  - respons mentah: ${JSON.stringify(err.response.data).slice(0, 400)}`);
  }

  return lines.join('\n');
}

main().catch((err) => {
  if (err instanceof ManifestError) {
    console.error(`\n${err.message}`);
    process.exit(1);
  }

  console.error(`\nGagal: ${err.message}`);

  const detail = describeGraphqlError(err);
  if (detail) console.error(detail);

  // Kegagalan pada operasi Projects hampir selalu soal izin token, jadi
  // sebutkan langsung perbaikannya daripada membiarkan orang menebak.
  if (/projectv2|project/i.test(err.message) || err.stack?.includes('syncProjectBoard')) {
    console.error(
      '\nBila ini soal izin: PROJECT_TOKEN harus fine-grained PAT dengan\n' +
        '"Projects: Read and write" di bagian ACCOUNT permissions (bukan Repository\n' +
        'permissions), dan resource owner-nya harus akun pemilik board.',
    );
  }

  if (err.stack) console.error(`\n${err.stack.split('\n').slice(1, 6).join('\n')}`);
  process.exit(1);
});
