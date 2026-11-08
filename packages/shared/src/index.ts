/**
 * Tipe data bersama antara apps/web dan apps/api.
 *
 * Diturunkan dari skema pada PRD. Istilah domain sengaja dipertahankan dalam
 * bahasa Indonesia pada label yang tampil ke pengguna, sementara nama tipe dan
 * properti memakai bahasa Inggris agar konsisten dengan skema database.
 */

// ---------------------------------------------------------------------------
// Enum domain
// ---------------------------------------------------------------------------

/** Tiga tahap proyek yang bisa dipindah-pindah dalam satu halaman. */
export const PROJECT_STAGES = ['plan', 'dev', 'release'] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

/** Kolom pada papan tugas. */
export const TASK_STATUSES = ['belum_mulai', 'dikerjakan', 'selesai'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Tingkat prioritas tugas. */
export const TASK_PRIORITIES = ['mendesak', 'sedang', 'santai'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const SPRINT_STATUSES = ['aktif', 'selesai'] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

/** Hak akses anggota terhadap sebuah proyek. */
export const MEMBER_ROLES = ['pemilik', 'editor', 'viewer'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Label berbahasa Indonesia untuk ditampilkan di antarmuka. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  belum_mulai: 'Belum mulai',
  dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  mendesak: 'Mendesak',
  sedang: 'Sedang',
  santai: 'Santai',
};

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  plan: 'Plan',
  dev: 'Dev',
  release: 'Release',
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  pemilik: 'Pemilik',
  editor: 'Editor',
  viewer: 'Viewer',
};

// ---------------------------------------------------------------------------
// Entitas
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  themePref: string | null;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdBy: string;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
}

export interface Sprint {
  id: string;
  projectId: string;
  sprintNumber: number;
  startDate: string | null;
  endDate: string | null;
  releaseTarget: string | null;
  status: SprintStatus;
}

export interface ProjectPlan {
  id: string;
  projectId: string;
  prdLink: string | null;
  prdFileUrl: string | null;
  designLink: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  sprintId: string | null;
  planId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  featureBranch: string | null;
  taskBranch: string | null;
  createdAt: string;
}

/**
 * Variabel environment milik sebuah proyek.
 *
 * `value` sengaja TIDAK ada di tipe ini. Nilai aslinya hanya dikirim lewat
 * endpoint terpisah yang memeriksa otorisasi; daftar biasa selalu menerima
 * `valueMasked` saja, sesuai persyaratan non-fungsional PRD.
 */
export interface EnvVariable {
  id: string;
  projectId: string;
  key: string;
  valueMasked: string;
  isReady: boolean;
  createdAt: string;
}

export interface DatabaseNote {
  id: string;
  projectId: string;
  dbName: string;
  queryText: string;
  isMasked: boolean;
  isReady: boolean;
  createdAt: string;
}

export interface TechNote {
  id: string;
  projectId: string;
  taskId: string | null;
  title: string;
  cause: string | null;
  solution: string | null;
  isBlocker: boolean;
  createdAt: string;
}

export interface ReleaseDocument {
  id: string;
  projectId: string;
  name: string;
  link: string | null;
  fileUrl: string | null;
  isRequired: boolean;
  isComplete: boolean;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
}

// ---------------------------------------------------------------------------
// Bentuk gabungan untuk tampilan
// ---------------------------------------------------------------------------

/** Satu butir yang belum lengkap pada pemeriksaan kesiapan rilis. */
export interface ReadinessItem {
  id: string;
  label: string;
  /** Bagian mana yang harus dibuka untuk melengkapinya. */
  section: 'rencana' | 'tugas' | 'env' | 'database' | 'dokumen';
  isComplete: boolean;
  hint: string | null;
}

export interface ReadinessSummary {
  isReady: boolean;
  totalItems: number;
  incompleteItems: number;
  items: ReadinessItem[];
}

/** Ringkasan satu tahap untuk kartu di Ruang Proyek. */
export interface StageSummary {
  stage: ProjectStage;
  /** Kosong berarti tahap ini belum diisi sama sekali. */
  isEmpty: boolean;
  /** Teks ringkas siap tampil, mis. "5 tugas selesai dari 8". */
  headline: string;
  completed: number;
  total: number;
}

/** Muatan utama halaman Ruang Proyek. */
export interface ProjectOverview {
  company: Pick<Company, 'id' | 'name'>;
  project: Pick<Project, 'id' | 'name' | 'description'>;
  activeSprint: Sprint | null;
  stages: StageSummary[];
  readiness: ReadinessSummary;
}

/** Status tenggat yang dihitung di backend, dipakai sebagai badge di lini masa. */
export const DEADLINE_STATUSES = ['aman', 'mendekati_tenggat', 'terlambat', 'belum_ditentukan'] as const;
export type DeadlineStatus = (typeof DEADLINE_STATUSES)[number];

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  aman: 'Aman',
  mendekati_tenggat: 'Mendekati tenggat',
  terlambat: 'Terlambat',
  belum_ditentukan: 'Belum ditentukan',
};

export interface TimelineRow {
  id: string;
  kind: 'proyek' | 'sprint';
  label: string;
  startDate: string | null;
  endDate: string | null;
  releaseTarget: string | null;
  deadlineStatus: DeadlineStatus;
  /** Hanya terisi saat status `terlambat`. */
  daysLate: number | null;
}
