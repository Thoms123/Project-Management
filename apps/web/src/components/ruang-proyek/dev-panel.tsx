import {
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@rtl/shared';
import { mockTasks } from '@/lib/mock/tasks';
import { cn } from '@/lib/utils';

const STATUS_TONE: Record<TaskStatus, string> = {
  belum_mulai: 'bg-surface-subtle text-text-muted',
  dikerjakan: 'bg-status-dev-bg text-status-dev',
  selesai: 'bg-status-ready-bg text-status-ready',
};

const PRIORITY_TONE: Record<TaskPriority, string> = {
  mendesak: 'bg-status-blocker-bg text-status-blocker',
  sedang: 'bg-status-plan-bg text-status-plan',
  santai: 'bg-surface-subtle text-text-muted',
};

function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex flex-col gap-2 border-b border-border-subtle py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-display">{task.title}</p>

        {task.taskBranch ? (
          <p className="mt-1 truncate font-mono text-xs text-text-muted">
            {task.featureBranch ? `${task.featureBranch} / ` : ''}
            {task.taskBranch}
          </p>
        ) : (
          // Cabang kosong disebut terang-terangan: itu justru hal yang mudah
          // terlewat saat menelusuri pekerjaan menjelang rilis.
          <p className="mt-1 text-xs text-text-muted italic">Cabang kerja belum dicatat.</p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <span
          className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', PRIORITY_TONE[task.priority])}
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>
        <span
          className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_TONE[task.status])}
        >
          {TASK_STATUS_LABELS[task.status]}
        </span>
      </div>
    </li>
  );
}

/**
 * Ringkasan tahap Dev: tugas sprint aktif beserta cabang kerjanya.
 *
 * Diurutkan mengikuti alur papan tugas — belum mulai, dikerjakan, selesai —
 * supaya yang masih menuntut perhatian muncul lebih dulu, bukan terkubur di
 * bawah daftar pekerjaan yang sudah beres.
 */
export function DevPanel({ tasks = mockTasks }: { tasks?: Task[] }) {
  const urut = [...tasks].sort(
    (a, b) => TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status),
  );

  if (urut.length === 0) {
    return (
      <div className="rounded-card bg-surface p-6 shadow-surface">
        <p className="text-sm text-text-muted">Belum ada tugas di sprint ini.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-surface p-6 shadow-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-text-display">Tugas sprint aktif</h3>
        <p className="text-sm text-text-muted">{urut.length} tugas</p>
      </div>

      <ul className="mt-2">
        {urut.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}
