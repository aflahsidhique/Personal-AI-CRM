import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageSquareText, Sparkles, AlertCircle } from 'lucide-react';
import { useConversationPrep } from '@/hooks/useCrm';

export default function ConversationPrepSheet({
  contactId,
  contactName,
  open,
  onClose,
}: {
  contactId: string;
  contactName: string;
  open: boolean;
  onClose: () => void;
}) {
  const prep = useConversationPrep();

  useEffect(() => {
    if (open) prep.mutate(contactId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId]);

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-50 h-dvh w-full max-w-md overflow-y-auto border-l-2 border-ink bg-surface p-4 sm:border-l-[3px] sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="nb-b grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lav text-onaccent">
                  <MessageSquareText size={17} strokeWidth={2.6} />
                </div>
                <div className="min-w-0">
                  <h2 className="nb-display text-base">Conversation Prep</h2>
                  <p className="nb-label truncate text-muted">With {contactName}</p>
                </div>
              </div>
              <button onClick={onClose} className="nb-btn nb-btn-icon bg-coral text-onaccent" aria-label="Close">
                <X size={17} strokeWidth={2.8} />
              </button>
            </div>

            {prep.isPending ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="nb-card-flat h-16 animate-pulse bg-sunken" />
                ))}
              </div>
            ) : prep.isError ? (
              <div className="nb-card flex items-start gap-2 bg-coral p-3.5 text-sm font-bold text-onaccent">
                <AlertCircle size={16} strokeWidth={2.6} className="mt-0.5 shrink-0" />
                {(prep.error as Error).message}
              </div>
            ) : prep.data ? (
              <div className="space-y-4">
                <Section title="Last Meeting">
                  <p className="nb-card-flat bg-sunken p-3 text-sm font-medium">{prep.data.lastMeeting}</p>
                </Section>

                <Section title="Personal Details">
                  <ul className="space-y-1.5">
                    {prep.data.personalDetails.map((d) => (
                      <li key={d} className="flex gap-2 text-sm font-medium">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lav ring-2 ring-ink" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Suggested Opening" icon>
                  <p className="nb-card bg-acid p-3 text-sm font-bold text-onaccent">{prep.data.suggestedOpening}</p>
                </Section>

                <Section title="Suggested Questions">
                  <ul className="space-y-1.5">
                    {prep.data.suggestedQuestions.map((q) => (
                      <li key={q} className="flex gap-2 text-sm font-medium">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aqua ring-2 ring-ink" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: boolean }) {
  return (
    <div>
      <h3 className="nb-label mb-1.5 flex items-center gap-1.5 text-muted">
        {icon && <Sparkles size={12} strokeWidth={2.8} />}
        {title}
      </h3>
      {children}
    </div>
  );
}
