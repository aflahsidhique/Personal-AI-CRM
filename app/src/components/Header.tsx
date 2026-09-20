import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, Search, Contact } from 'lucide-react';
import { useUIStore } from '@/data/store';

export default function Header() {
  const { darkMode, toggleDarkMode } = useUIStore();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/assistant?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b-2 border-ink bg-paper px-3 py-2.5 sm:gap-3 sm:border-b-[3px] sm:px-5 sm:py-3">
      <div className="nb-b grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-acid text-onaccent md:hidden">
        <Contact size={18} strokeWidth={2.6} />
      </div>

      <form onSubmit={onSearch} className="relative min-w-0 flex-1 sm:max-w-md">
        <Search
          size={16}
          strokeWidth={2.6}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask AI…"
          aria-label="Ask the AI assistant"
          className="nb-input pl-8 sm:pl-9"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button className="nb-btn nb-btn-icon hidden bg-bubble text-onaccent xs:inline-flex" aria-label="Notifications">
          <Bell size={17} strokeWidth={2.6} />
        </button>
        <button
          onClick={toggleDarkMode}
          className="nb-btn nb-btn-icon bg-sun text-onaccent"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={17} strokeWidth={2.6} /> : <Moon size={17} strokeWidth={2.6} />}
        </button>
      </div>
    </header>
  );
}
