import { cn } from '@/lib/utils';

interface PendingSectionProps {
  title: string;
  description: string;
  /** Key task di .github/roadmap.yml, mis. "F01-T02". */
  taskKey: string;
  /** Nomor Issue GitHub yang mengerjakan bagian ini. */
  issue: number;
  className?: string;
}

/**
 * Penanda bagian halaman yang strukturnya sudah ada tapi isinya belum.
 *
 * Sengaja terlihat jelas belum jadi — bukan kerangka abu-abu yang menyerupai
 * konten — supaya tidak ada yang mengira bagian ini sudah selesai. Setiap
 * penanda menyebut task yang akan menggantikannya, dan ikut terhapus saat
 * task itu dikerjakan.
 */
export function PendingSection({
  title,
  description,
  taskKey,
  issue,
  className,
}: PendingSectionProps) {
  return (
    <section
      className={cn(
        'rounded-card border-2 border-dashed border-border-subtle bg-surface/60 p-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-text-display">{title}</h2>
        <a
          href={`https://github.com/Thoms123/Project-Management/issues/${issue}`}
          className="rounded-full bg-status-dev-bg px-2.5 py-0.5 font-mono text-[11px] font-semibold text-status-dev hover:underline"
        >
          {taskKey} · #{issue}
        </a>
      </div>
      <p className="mt-2 max-w-prose text-sm text-text-muted">{description}</p>
    </section>
  );
}
