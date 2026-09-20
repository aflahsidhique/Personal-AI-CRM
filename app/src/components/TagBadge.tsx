import type { Tag } from '@/types';
import { cn } from '@/lib/utils';

const TAG_STYLES: Record<Tag, string> = {
  Investor: 'bg-lav',
  Client: 'bg-aqua',
  Friend: 'bg-mint',
  Recruiter: 'bg-sun',
  Startup: 'bg-bubble',
  Lead: 'bg-acid',
  VIP: 'bg-coral',
  Family: 'bg-surface',
};

export default function TagBadge({ tag, className }: { tag: Tag; className?: string }) {
  return (
    <span className={cn('nb-chip text-onaccent', TAG_STYLES[tag], tag === 'Family' && 'text-ink', className)}>
      {tag}
    </span>
  );
}
