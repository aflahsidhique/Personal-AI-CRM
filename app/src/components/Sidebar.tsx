import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ListChecks, Mic, Sparkles, Settings, Contact } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true, accent: 'bg-acid' },
  { to: '/contacts', label: 'Contacts', short: 'People', icon: Users, accent: 'bg-lav' },
  { to: '/tasks', label: 'Tasks', short: 'Tasks', icon: ListChecks, accent: 'bg-coral' },
  { to: '/meeting-notes', label: 'Meeting Notes', short: 'Notes', icon: Mic, accent: 'bg-aqua' },
  { to: '/assistant', label: 'AI Assistant', short: 'Ask AI', icon: Sparkles, accent: 'bg-bubble' },
  { to: '/settings', label: 'Settings', short: 'Config', icon: Settings, accent: 'bg-sun' },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r-2 border-ink bg-surface p-3 sm:border-r-[3px] md:flex md:w-[92px] xl:w-64 xl:p-4">
      <div className="mb-6 flex items-center gap-2.5 xl:mb-8">
        <div className="nb-b grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-acid text-onaccent">
          <Contact size={20} strokeWidth={2.6} />
        </div>
        <div className="hidden min-w-0 xl:block">
          <div className="nb-display truncate text-[15px]">AI CRM</div>
          <div className="nb-label truncate text-muted">Never forget anyone</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV.map(({ to, label, short, icon: Icon, end, accent }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-xl border-2 text-[13px] font-bold transition-all sm:border-[3px]',
                'max-xl:flex-col max-xl:gap-1 max-xl:px-1 max-xl:py-2.5 xl:px-3 xl:py-2.5',
                isActive
                  ? cn('nb-sh border-ink text-onaccent', accent)
                  : 'border-transparent text-muted hover:border-ink hover:bg-sunken hover:text-ink'
              )
            }
          >
            <Icon size={19} strokeWidth={2.5} className="shrink-0" />
            <span className="hidden truncate xl:inline">{label}</span>
            <span className="nb-label text-[9px] leading-none xl:hidden">{short}</span>
          </NavLink>
        ))}
      </nav>

      <div className="nb-card mt-auto flex items-center gap-2.5 p-2 xl:p-3">
        <div className="nb-b grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lav text-[13px] font-bold text-onaccent">
          DU
        </div>
        <div className="hidden min-w-0 xl:block">
          <div className="truncate text-sm font-bold">Demo User</div>
          <div className="nb-label truncate text-muted">Free plan</div>
        </div>
      </div>
    </aside>
  );
}
