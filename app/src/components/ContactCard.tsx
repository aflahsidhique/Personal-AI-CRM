import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import type { Contact } from '@/types';
import Avatar from './Avatar';
import TagBadge from './TagBadge';
import RelationshipScore from './RelationshipScore';
import { useTimeline, useTasks } from '@/hooks/useCrm';
import { computeRelationshipScore } from '@/lib/utils';

export default function ContactCard({ contact }: { contact: Contact }) {
  const { data: timeline = [] } = useTimeline();
  const { data: tasks = [] } = useTasks();
  const score = computeRelationshipScore(contact, timeline, tasks);

  return (
    <Link
      to={`/contacts/${contact.id}`}
      className="nb-card nb-lift flex h-full flex-col gap-3 p-3 sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={contact.name} size="lg" />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold leading-tight">{contact.name}</div>
            {contact.company && (
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted">
                <Building2 size={12} strokeWidth={2.6} className="shrink-0" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-1 text-xs font-medium text-muted">
                <MapPin size={12} strokeWidth={2.6} className="shrink-0" />
                <span className="truncate">{contact.location}</span>
              </div>
            )}
          </div>
        </div>
        <RelationshipScore score={score} size={54} showLabel={false} />
      </div>

      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
      )}

      <p className="line-clamp-2 border-t-2 border-dashed border-ink/25 pt-2.5 text-xs font-medium text-muted">
        {contact.aiSummary || 'No AI summary yet — open this contact to generate one.'}
      </p>
    </Link>
  );
}
