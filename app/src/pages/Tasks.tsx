import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown } from 'lucide-react';
import { useTasks, useCreateTask, useContacts } from '@/hooks/useCrm';
import type { TaskStatus } from '@/types';
import TaskCard from '@/components/TaskCard';

const COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: 'today', label: 'Today', accent: 'bg-coral' },
  { key: 'upcoming', label: 'Upcoming', accent: 'bg-lav' },
  { key: 'done', label: 'Done', accent: 'bg-mint' },
];

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: contacts = [] } = useContacts();
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(
      { title: title.trim(), contactId: contactId || undefined, status: 'today', source: 'manual' },
      { onSuccess: () => setTitle('') }
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="nb-display text-2xl sm:text-4xl">Tasks</h1>
        <p className="mt-1 text-sm font-medium text-muted">
          {tasks.length} total — manual and AI-suggested follow-ups.
        </p>
      </div>

      <form onSubmit={handleAdd} className="nb-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          aria-label="New task title"
          className="nb-input min-w-0 flex-1"
        />
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 sm:w-44 sm:flex-none">
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              aria-label="Link to contact"
              className="nb-input nb-select"
            >
              <option value="">No contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              strokeWidth={2.8}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim() || createTask.isPending}
            className="nb-btn shrink-0 bg-acid text-onaccent"
          >
            <Plus size={15} strokeWidth={2.8} /> Add
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="nb-card-flat h-48 animate-pulse bg-sunken" />
          ))}
        </div>
      ) : (
        /* phones: swipeable columns; tablet and up: three-up board */
        <div className="nb-rail -mx-3 px-3 pb-2 xs:-mx-4 xs:px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.key);
            return (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[78vw] shrink-0 space-y-3 xs:w-[68vw] sm:w-[48vw] md:w-auto"
              >
                <div className={`nb-card flex items-center gap-2 p-2.5 text-onaccent ${col.accent}`}>
                  <h2 className="nb-display text-sm">{col.label}</h2>
                  <span className="nb-b ml-auto grid h-6 min-w-6 place-items-center rounded-md bg-surface px-1 text-xs font-bold text-ink">
                    {items.length}
                  </span>
                </div>
                <div className="nb-card-flat min-h-48 space-y-2.5 bg-sunken p-2.5">
                  {items.length === 0 ? (
                    <p className="nb-label p-3 text-center text-muted">No tasks here.</p>
                  ) : (
                    items.map((t) => <TaskCard key={t.id} task={t} />)
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
