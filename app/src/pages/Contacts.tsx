import { useMemo, useState } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { useContacts, useCreateContact } from '@/hooks/useCrm';
import type { Tag } from '@/types';
import ContactCard from '@/components/ContactCard';
import TagBadge from '@/components/TagBadge';
import ContactFormModal from '@/components/ContactFormModal';
import { cn } from '@/lib/utils';

const ALL_TAGS: Tag[] = ['Investor', 'Client', 'Friend', 'Recruiter', 'Startup', 'Lead', 'VIP', 'Family'];

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();
  const createContact = useCreateContact();
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<Tag | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      const matchesTag = !activeTag || c.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [contacts, query, activeTag]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="nb-display text-2xl sm:text-4xl">Contacts</h1>
          <p className="mt-1 text-sm font-medium text-muted">{contacts.length} people in your network</p>
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <Search
              size={16}
              strokeWidth={2.6}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, company…"
              aria-label="Search contacts"
              className="nb-input pl-8"
            />
          </div>
          <button onClick={() => setFormOpen(true)} className="nb-btn shrink-0 bg-acid text-onaccent">
            <Plus size={16} strokeWidth={2.8} />
            <span className="hidden xs:inline">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Tag filters — scroll horizontally on phones instead of wrapping into a wall */}
      <div className="nb-rail -mx-3 px-3 pb-1 xs:-mx-4 xs:px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setActiveTag(null)}
          className={cn('nb-chip shrink-0', !activeTag ? 'nb-sh bg-ink text-paper' : 'bg-surface text-muted')}
        >
          All
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className="shrink-0"
            aria-pressed={activeTag === tag}
          >
            <TagBadge tag={tag} className={cn(activeTag === tag ? 'nb-sh' : 'opacity-55')} />
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="nb-card-flat h-44 animate-pulse bg-sunken" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="nb-card flex flex-col items-center gap-3 p-8 text-center sm:p-14">
          <div className="nb-b grid h-14 w-14 place-items-center rounded-2xl bg-lav text-onaccent">
            <Users size={24} strokeWidth={2.6} />
          </div>
          <p className="text-sm font-medium text-muted">No contacts yet — add your first one to get started.</p>
          <button onClick={() => setFormOpen(true)} className="nb-btn bg-acid text-onaccent">
            <Plus size={16} strokeWidth={2.8} /> Add Contact
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="nb-card p-8 text-center text-sm font-bold sm:p-10">No contacts match that filter.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}

      <ContactFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        submitting={createContact.isPending}
        onSubmit={(data) => createContact.mutate(data, { onSuccess: () => setFormOpen(false) })}
      />
    </div>
  );
}
