import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Contact, Tag } from '@/types';
import type { ContactInput } from '@/lib/api';
import { cn } from '@/lib/utils';

const ALL_TAGS: Tag[] = ['Investor', 'Client', 'Friend', 'Recruiter', 'Startup', 'Lead', 'VIP', 'Family'];

export default function ContactFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContactInput) => void;
  submitting?: boolean;
  initial?: Contact;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [company, setCompany] = useState(initial?.company ?? '');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [birthday, setBirthday] = useState(initial?.birthday?.slice(0, 10) ?? '');
  const [tags, setTags] = useState<Tag[]>(initial?.tags ?? []);
  const [linkedin, setLinkedin] = useState(initial?.social.linkedin ?? '');
  const [notesText, setNotesText] = useState('');

  function toggleTag(tag: Tag) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      phone,
      email,
      company,
      position,
      location,
      tags,
      birthday: birthday || null,
      social: { linkedin },
      notes: notesText
        .split('\n')
        .map((n) => n.trim())
        .filter(Boolean),
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/50"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-2xl border-t-2 border-ink bg-surface p-4 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88dvh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-[3px] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="nb-display text-lg sm:text-xl">{initial ? 'Edit Contact' : 'Add Contact'}</h2>
              <button onClick={onClose} className="nb-btn nb-btn-icon bg-coral text-onaccent" aria-label="Close">
                <X size={17} strokeWidth={2.8} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field label="Name *">
                <input value={name} onChange={(e) => setName(e.target.value)} required className="nb-input" />
              </Field>

              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                <Field label="Phone">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="nb-input" />
                </Field>
                <Field label="Email">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" className="nb-input" />
                </Field>
                <Field label="Company">
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="nb-input" />
                </Field>
                <Field label="Position">
                  <input value={position} onChange={(e) => setPosition(e.target.value)} className="nb-input" />
                </Field>
                <Field label="Location">
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className="nb-input" />
                </Field>
                <Field label="Birthday">
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="nb-input" />
                </Field>
              </div>

              <Field label="LinkedIn">
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/…"
                  className="nb-input"
                />
              </Field>

              <Field label="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'nb-chip transition-colors',
                        tags.includes(tag) ? 'nb-sh bg-acid text-onaccent' : 'bg-surface text-muted'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </Field>

              {!initial && (
                <Field label="Notes (one per line)">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={3}
                    placeholder={'Met at a conference\nInterested in AI\nLooking for a Flutter developer'}
                    className="nb-input resize-none"
                  />
                </Field>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 xs:flex-row xs:justify-end">
                <button type="button" onClick={onClose} className="nb-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!name.trim() || submitting} className="nb-btn bg-acid text-onaccent">
                  {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="nb-label mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}
