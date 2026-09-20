import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Send, AlertCircle } from 'lucide-react';
import { useSmartSearch } from '@/hooks/useCrm';
import type { Contact } from '@/types';
import ContactCard from '@/components/ContactCard';

const EXAMPLE_PROMPTS = [
  'Show everyone interested in AI',
  'Clients from Dubai',
  'People I met last month',
  'Who should I follow up with?',
  'Show me my investors',
];

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  results?: Contact[];
  isError?: boolean;
}

export default function Assistant() {
  const smartSearch = useSmartSearch();
  const [params] = useSearchParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: "Hi! Ask me things like \"clients from Dubai\" or \"who should I follow up with?\" and I'll search your CRM.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ranInitialQuery = useRef(false);

  async function runQuery(query: string) {
    if (!query.trim() || smartSearch.isPending) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: query }]);
    setInput('');
    try {
      const { message, results } = await smartSearch.mutateAsync(query);
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: 'ai', text: message || `Found ${results.length} match(es).`, results },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'ai', text: (err as Error).message, isError: true }]);
    }
  }

  useEffect(() => {
    const q = params.get('q');
    if (q && !ranInitialQuery.current) {
      ranInitialQuery.current = true;
      runQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, smartSearch.isPending]);

  return (
    <div className="flex min-h-[26rem] flex-col" style={{ height: 'calc(100dvh - 13rem)' }}>
      <div className="mb-3">
        <h1 className="nb-display text-2xl sm:text-4xl">AI Assistant</h1>
        <p className="mt-1 text-sm font-medium text-muted">Smart search across your entire network.</p>
      </div>

      <div className="nb-rail -mx-3 mb-3 px-3 pb-1 xs:-mx-4 xs:px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {EXAMPLE_PROMPTS.map((p) => (
          <button key={p} onClick={() => runQuery(p)} className="nb-btn shrink-0 px-2.5 py-1 text-[11px]">
            {p}
          </button>
        ))}
      </div>

      <div className="nb-card min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-5">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={m.role === 'user' ? 'flex justify-end' : ''}
          >
            {m.role === 'user' ? (
              <div className="nb-b nb-sh max-w-[85%] rounded-xl rounded-br-sm bg-acid px-3.5 py-2 text-sm font-bold text-onaccent">
                {m.text}
              </div>
            ) : (
              <div className="max-w-full">
                <div className="mb-2 flex items-start gap-2">
                  <div
                    className={`nb-b grid h-7 w-7 shrink-0 place-items-center rounded-lg text-onaccent ${
                      m.isError ? 'bg-coral' : 'bg-lav'
                    }`}
                  >
                    {m.isError ? (
                      <AlertCircle size={13} strokeWidth={2.8} />
                    ) : (
                      <Sparkles size={13} strokeWidth={2.8} />
                    )}
                  </div>
                  <span className="min-w-0 pt-1 text-sm font-medium">{m.text}</span>
                </div>
                {m.results && m.results.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:pl-9 lg:grid-cols-2">
                    {m.results.map((c) => (
                      <ContactCard key={c.id} contact={c} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {smartSearch.isPending && (
          <div className="flex items-center gap-2">
            <div className="nb-b grid h-7 w-7 place-items-center rounded-lg bg-lav text-onaccent">
              <Sparkles size={13} strokeWidth={2.8} />
            </div>
            <span className="flex gap-1">
              {[0, 0.15, 0.3].map((d) => (
                <span
                  key={d}
                  className="h-2 w-2 animate-bounce rounded-full bg-ink"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runQuery(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your network…"
          aria-label="Ask about your network"
          className="nb-input min-w-0 flex-1 py-2.5"
        />
        <button type="submit" className="nb-btn nb-btn-icon shrink-0 bg-acid p-3 text-onaccent" aria-label="Send">
          <Send size={17} strokeWidth={2.8} />
        </button>
      </form>
    </div>
  );
}
