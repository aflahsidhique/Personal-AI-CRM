import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import type { Task } from '@/types';
import { useContacts, useUpdateTaskStatus } from '@/hooks/useCrm';
import { formatDate } from '@/lib/utils';

const NEXT_STATUS: Record<Task['status'], Task['status'] | null> = {
  today: 'upcoming',
  upcoming: 'done',
  done: null,
};

export default function TaskCard({ task }: { task: Task }) {
  const { data: contacts = [] } = useContacts();
  const updateStatus = useUpdateTaskStatus();
  const contact = task.contactId ? contacts.find((c) => c.id === task.contactId) : undefined;
  const next = NEXT_STATUS[task.status];

  return (
    <div className="nb-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-bold leading-snug">{task.title}</p>
        {task.source === 'ai' && (
          <span
            className="nb-b grid h-6 w-6 shrink-0 place-items-center rounded-md bg-bubble text-onaccent"
            title="AI-suggested"
          >
            <Sparkles size={11} strokeWidth={2.8} />
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-ink/25 pt-2.5">
        <div className="nb-label min-w-0 truncate text-muted">
          {contact ? (
            <Link to={`/contacts/${contact.id}`} className="underline decoration-2 underline-offset-2 hover:text-ink">
              {contact.name}
            </Link>
          ) : (
            'General'
          )}
          {' · '}
          {formatDate(task.dueDate)}
        </div>

        {task.status === 'done' ? (
          <button
            onClick={() => updateStatus.mutate({ id: task.id, status: 'upcoming' })}
            disabled={updateStatus.isPending}
            className="nb-btn px-2 py-1 text-[11px]"
          >
            <RotateCcw size={11} strokeWidth={2.8} /> Reopen
          </button>
        ) : (
          next && (
            <button
              onClick={() => updateStatus.mutate({ id: task.id, status: next })}
              disabled={updateStatus.isPending}
              className="nb-btn bg-acid px-2 py-1 text-[11px] text-onaccent"
            >
              Move <ArrowRight size={11} strokeWidth={2.8} />
            </button>
          )
        )}
      </div>
    </div>
  );
}
