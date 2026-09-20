import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ListChecks, Mic, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true, accent: 'bg-acid' },
  { to: '/contacts', label: 'People', icon: Users, accent: 'bg-lav' },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, accent: 'bg-coral' },
  { to: '/meeting-notes', label: 'Notes', icon: Mic, accent: 'bg-aqua' },
  { to: '/assistant', label: 'AI', icon: Sparkles, accent: 'bg-bubble' },
];

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t-2 border-ink bg-surface px-1.5 pt-1.5 md:hidden"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      {NAV.map(({ to, label, icon: Icon, end, accent }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-lg border-2 px-1 py-1.5 transition-colors',
              isActive ? cn('border-ink text-onaccent', accent) : 'border-transparent text-muted'
            )
          }
        >
          <Icon size={18} strokeWidth={2.6} />
          <span className="nb-label text-[9px] leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
