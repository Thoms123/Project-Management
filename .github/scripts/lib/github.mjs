/**
 * Wrapper tipis di atas GitHub REST & GraphQL API untuk kebutuhan Roadmap Sync:
 * label, Issue, sub-issue native, dan Projects v2.
 */

import { Octokit } from '@octokit/rest';
import { retry } from '@octokit/plugin-retry';
import { throttling } from '@octokit/plugin-throttling';
import { graphql } from '@octokit/graphql';

const RestClient = Octokit.plugin(retry, throttling);

/** Marker idempotensi yang disimpan di body setiap Issue. */
const MARKER_RE = /<!--\s*roadmap-key:\s*([A-Za-z0-9._-]+)\s*-->/;

export function markerFor(key) {
  return `<!-- roadmap-key: ${key} -->`;
}

export function extractKey(body) {
  const match = MARKER_RE.exec(body ?? '');
  return match ? match[1] : null;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Jeda antar operasi pembuatan konten.
 *
 * GitHub membatasi ~80 request pembuatan konten per menit (secondary rate
 * limit). 1200 ms memberi ~50/menit — cukup longgar agar plugin throttling
 * tidak perlu sering mundur, tapi masih menyelesaikan satu fase dalam waktu
 * wajar.
 */
export const CREATE_DELAY_MS = 1200;

export function makeRest(token, { label = 'rest' } = {}) {
  return new RestClient({
    auth: token,
    userAgent: 'roadmap-sync',
    throttle: {
      onRateLimit: (retryAfter, options, _octokit, retryCount) => {
        console.warn(`[${label}] Kena rate limit pada ${options.method} ${options.url}. Tunggu ${retryAfter}s (percobaan ${retryCount + 1}).`);
        return retryCount < 5;
      },
      onSecondaryRateLimit: (retryAfter, options, _octokit, retryCount) => {
        console.warn(`[${label}] Kena secondary rate limit pada ${options.method} ${options.url}. Tunggu ${retryAfter}s (percobaan ${retryCount + 1}).`);
        return retryCount < 5;
      },
    },
  });
}

export function makeGraphql(token) {
  return graphql.defaults({ headers: { authorization: `token ${token}` } });
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

/**
 * Membuat label bila belum ada, atau menyelaraskan warna/deskripsi bila sudah.
 * Aman dijalankan berulang.
 */
export async function ensureLabel(rest, owner, repo, { name, color, description }) {
  try {
    const { data } = await rest.issues.getLabel({ owner, repo, name });
    if (data.color?.toLowerCase() !== color.toLowerCase() || (data.description ?? '') !== (description ?? '')) {
      await rest.issues.updateLabel({ owner, repo, name, color, description });
      return 'updated';
    }
    return 'unchanged';
  } catch (err) {
    if (err.status !== 404) throw err;
    try {
      await rest.issues.createLabel({ owner, repo, name, color, description });
      return 'created';
    } catch (createErr) {
      // Balapan antar run: label sempat dibuat pihak lain di antara get & create.
      if (createErr.status === 422) return 'unchanged';
      throw createErr;
    }
  }
}

// ---------------------------------------------------------------------------
// Issue
// ---------------------------------------------------------------------------

/**
 * Mengumpulkan SEMUA Issue repo (terbuka maupun tertutup) dan memetakannya
 * berdasarkan marker roadmap-key.
 *
 * Sengaja memakai enumerasi langsung, BUKAN Search API: index pencarian GitHub
 * punya lag sampai beberapa menit setelah Issue dibuat, sehingga run yang
 * dijalankan berdekatan bisa menganggap Issue baru belum ada dan membuatnya
 * dua kali. Enumerasi selalu konsisten.
 */
export async function fetchRoadmapIssues(rest, owner, repo) {
  const byKey = new Map();
  let scanned = 0;

  for await (const page of rest.paginate.iterator(rest.issues.listForRepo, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const issue of page.data) {
      if (issue.pull_request) continue; // listForRepo juga mengembalikan PR
      scanned += 1;
      const key = extractKey(issue.body);
      if (key && !byKey.has(key)) byKey.set(key, issue);
    }
  }

  return { byKey, scanned };
}

export async function createIssue(rest, owner, repo, { title, body, labels }) {
  const { data } = await rest.issues.create({ owner, repo, title, body, labels });
  return data;
}

export async function updateIssue(rest, owner, repo, number, fields) {
  const { data } = await rest.issues.update({ owner, repo, issue_number: number, ...fields });
  return data;
}

// ---------------------------------------------------------------------------
// Sub-issue (native)
// ---------------------------------------------------------------------------

export async function listSubIssues(rest, owner, repo, issueNumber) {
  const results = [];
  for await (const page of rest.paginate.iterator('GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues', {
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  })) {
    results.push(...page.data);
  }
  return results;
}

/**
 * Menautkan satu Issue sebagai sub-issue dari Issue lain.
 *
 * PENTING: payload butuh `id` (database id) Issue anak, BUKAN `number`-nya.
 * Mengirim `number` menghasilkan 422 yang pesannya menyesatkan.
 */
export async function addSubIssue(rest, owner, repo, parentNumber, childId) {
  await rest.request('POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues', {
    owner,
    repo,
    issue_number: parentNumber,
    sub_issue_id: childId,
  });
}

// ---------------------------------------------------------------------------
// Projects v2
// ---------------------------------------------------------------------------

export async function getRepositoryId(gql, owner, repo) {
  const res = await gql(
    `query($owner:String!, $repo:String!) {
       repository(owner:$owner, name:$repo) { id }
     }`,
    { owner, repo },
  );
  return res.repository.id;
}

/** Mengambil id node pemilik project, baik akun pengguna maupun organisasi. */
export async function getOwnerId(gql, login) {
  const res = await gql(
    `query($login:String!) {
       user(login:$login) { id }
       organization(login:$login) { id }
     }`,
    { login },
  ).catch(async (err) => {
    // Salah satu dari user/organization pasti null dan GraphQL mengembalikannya
    // sebagai error parsial. Pakai data yang berhasil terambil.
    if (err.data) return err.data;
    throw err;
  });

  const id = res.user?.id ?? res.organization?.id;
  if (!id) throw new Error(`Tidak menemukan akun atau organisasi bernama "${login}".`);
  return id;
}

export async function findProjectByTitle(gql, login, title) {
  const query = `
    query($login:String!, $cursor:String) {
      user(login:$login) {
        projectsV2(first:100, after:$cursor) {
          nodes { id number title }
          pageInfo { hasNextPage endCursor }
        }
      }
      organization(login:$login) {
        projectsV2(first:100, after:$cursor) {
          nodes { id number title }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`;

  let cursor = null;
  for (;;) {
    const res = await gql(query, { login, cursor }).catch((err) => {
      if (err.data) return err.data;
      throw err;
    });

    const conn = res.user?.projectsV2 ?? res.organization?.projectsV2;
    if (!conn) return null;

    const hit = conn.nodes.find((n) => n.title === title);
    if (hit) return hit;
    if (!conn.pageInfo.hasNextPage) return null;
    cursor = conn.pageInfo.endCursor;
  }
}

export async function createProject(gql, ownerId, title) {
  const res = await gql(
    `mutation($ownerId:ID!, $title:String!) {
       createProjectV2(input:{ownerId:$ownerId, title:$title}) {
         projectV2 { id number title }
       }
     }`,
    { ownerId, title },
  );
  return res.createProjectV2.projectV2;
}

export async function linkProjectToRepository(gql, projectId, repositoryId) {
  await gql(
    `mutation($projectId:ID!, $repositoryId:ID!) {
       linkProjectV2ToRepository(input:{projectId:$projectId, repositoryId:$repositoryId}) {
         repository { id }
       }
     }`,
    { projectId, repositoryId },
  );
}

export async function listProjectFields(gql, projectId) {
  const res = await gql(
    `query($projectId:ID!) {
       node(id:$projectId) {
         ... on ProjectV2 {
           fields(first:50) {
             nodes {
               ... on ProjectV2FieldCommon { id name dataType }
               ... on ProjectV2SingleSelectField { id name options { id name } }
             }
           }
         }
       }
     }`,
    { projectId },
  );

  const fields = new Map();
  for (const field of res.node.fields.nodes) {
    if (!field?.name) continue;
    fields.set(field.name, {
      id: field.id,
      name: field.name,
      options: new Map((field.options ?? []).map((o) => [o.name, o.id])),
    });
  }
  return fields;
}

/**
 * Memastikan ada field single-select dengan nama & opsi yang diminta.
 *
 * Catatan: GitHub tidak menyediakan mutation untuk MENAMBAH opsi ke field
 * single-select yang sudah ada tanpa menimpa seluruh daftar opsinya. Jadi bila
 * field sudah ada, opsinya dipakai apa adanya dan opsi yang hilang dilaporkan
 * sebagai peringatan — tidak dipaksa diubah, supaya data item yang sudah
 * terisi tidak rusak.
 */
export async function ensureSingleSelectField(gql, projectId, name, options) {
  const existing = await listProjectFields(gql, projectId);
  if (existing.has(name)) {
    const field = existing.get(name);
    const missing = options.map((o) => o.name).filter((n) => !field.options.has(n));
    if (missing.length > 0) {
      console.warn(`[project] Field "${name}" sudah ada tapi belum punya opsi: ${missing.join(', ')}. Tambahkan manual di UI bila diperlukan.`);
    }
    return field;
  }

  const res = await gql(
    `mutation($projectId:ID!, $name:String!, $options:[ProjectV2SingleSelectFieldOptionInput!]!) {
       createProjectV2Field(input:{
         projectId:$projectId, dataType:SINGLE_SELECT, name:$name, singleSelectOptions:$options
       }) {
         projectV2Field {
           ... on ProjectV2SingleSelectField { id name options { id name } }
         }
       }
     }`,
    { projectId, name, options },
  );

  const field = res.createProjectV2Field.projectV2Field;
  return {
    id: field.id,
    name: field.name,
    options: new Map(field.options.map((o) => [o.name, o.id])),
  };
}

/** Menambahkan Issue ke project. Idempoten: item yang sudah ada dikembalikan. */
export async function addProjectItem(gql, projectId, contentId) {
  const res = await gql(
    `mutation($projectId:ID!, $contentId:ID!) {
       addProjectV2ItemById(input:{projectId:$projectId, contentId:$contentId}) {
         item { id }
       }
     }`,
    { projectId, contentId },
  );
  return res.addProjectV2ItemById.item.id;
}

export async function setSingleSelectValue(gql, projectId, itemId, fieldId, optionId) {
  await gql(
    `mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $optionId:String!) {
       updateProjectV2ItemFieldValue(input:{
         projectId:$projectId, itemId:$itemId, fieldId:$fieldId,
         value:{ singleSelectOptionId:$optionId }
       }) {
         projectV2Item { id }
       }
     }`,
    { projectId, itemId, fieldId, optionId },
  );
}

export async function listProjectViews(gql, projectId) {
  const res = await gql(
    `query($projectId:ID!) {
       node(id:$projectId) {
         ... on ProjectV2 {
           views(first:50) { nodes { id name layout filter } }
         }
       }
     }`,
    { projectId },
  );
  return new Map(res.node.views.nodes.map((v) => [v.name, v]));
}

/**
 * Memastikan ada view dengan nama, layout, dan filter tertentu.
 *
 * `filter` tidak bisa diset lewat createProjectV2View (input-nya hanya
 * menerima projectId, name, layout, dan visibleFieldIds), jadi view dibuat
 * dulu lalu filternya dipasang lewat updateProjectV2View.
 */
export async function ensureView(gql, projectId, { name, layout, filter }) {
  const views = await listProjectViews(gql, projectId);
  let view = views.get(name);

  if (!view) {
    const res = await gql(
      `mutation($projectId:ID!, $name:String!, $layout:ProjectV2ViewLayout!) {
         createProjectV2View(input:{projectId:$projectId, name:$name, layout:$layout}) {
           projectV2View { id name layout filter }
         }
       }`,
      { projectId, name, layout },
    );
    view = res.createProjectV2View.projectV2View;
  }

  if (filter !== undefined && view.filter !== filter) {
    await gql(
      `mutation($viewId:ID!, $filter:String!) {
         updateProjectV2View(input:{viewId:$viewId, filter:$filter}) {
           projectV2View { id name filter }
         }
       }`,
      { viewId: view.id, filter },
    );
  }

  return view;
}
