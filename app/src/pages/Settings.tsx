import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Upload, Download, Bell, KeyRound, ServerCog, CheckCircle2, XCircle } from 'lucide-react';
import { useUIStore } from '@/data/store';
import { useHealth } from '@/hooks/useCrm';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useUIStore();
  const [notifications, setNotifications] = useState(true);
  const { data: health, isError } = useHealth();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="nb-display text-2xl sm:text-4xl">Settings</h1>
        <p className="mt-1 text-sm font-medium text-muted">Manage your workspace preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
        <Row
          icon={darkMode ? <Moon size={16} strokeWidth={2.6} /> : <Sun size={16} strokeWidth={2.6} />}
          accent="bg-lav"
          title="Theme"
          description="Toggle between light and dark mode"
          action={
            <button onClick={toggleDarkMode} className="nb-btn bg-sun px-2.5 py-1 text-[11px] text-onaccent">
              {darkMode ? 'Dark' : 'Light'}
            </button>
          }
        />
        <Row
          icon={<Bell size={16} strokeWidth={2.6} />}
          accent="bg-bubble"
          title="Notifications"
          description="Reminders for follow-ups and birthdays"
          action={<Toggle checked={notifications} onChange={setNotifications} />}
        />
        <Row
          icon={<Upload size={16} strokeWidth={2.6} />}
          accent="bg-aqua"
          title="Import CSV"
          description="Bring in contacts from another CRM"
          action={<ProBadge />}
        />
        <Row
          icon={<Download size={16} strokeWidth={2.6} />}
          accent="bg-mint"
          title="Export Contacts"
          description="Download your network as CSV"
          action={<ProBadge />}
        />
      </motion.div>

      <div>
        <h2 className="nb-label mb-2 text-muted">Connections</h2>
        <div className="space-y-2.5">
          <Row
            icon={<ServerCog size={16} strokeWidth={2.6} />}
            accent="bg-acid"
            title="API Server"
            description={isError ? 'Not reachable — is the server running on :4000?' : 'http://localhost:4000/api'}
            action={
              isError ? (
                <XCircle size={20} strokeWidth={2.6} className="shrink-0 text-coral" />
              ) : health?.ok ? (
                <CheckCircle2 size={20} strokeWidth={2.6} className="shrink-0" />
              ) : null
            }
          />
          <Row
            icon={<KeyRound size={16} strokeWidth={2.6} />}
            accent="bg-coral"
            title="OpenRouter AI"
            description={
              health?.openrouterConfigured
                ? 'Connected — AI features are live'
                : 'Not configured — set OPENROUTER_API_KEY in server/.env'
            }
            action={
              health?.openrouterConfigured ? (
                <CheckCircle2 size={20} strokeWidth={2.6} className="shrink-0" />
              ) : (
                <XCircle size={20} strokeWidth={2.6} className="shrink-0 text-coral" />
              )
            }
          />
          <Row
            icon={<KeyRound size={16} strokeWidth={2.6} />}
            accent="bg-aqua"
            title="Sarvam Speech-to-Text"
            description={
              health?.sarvamConfigured
                ? 'Connected — audio transcription is live'
                : 'Not configured — set SARVAM_API_KEY in server/.env'
            }
            action={
              health?.sarvamConfigured ? (
                <CheckCircle2 size={20} strokeWidth={2.6} className="shrink-0" />
              ) : (
                <XCircle size={20} strokeWidth={2.6} className="shrink-0 text-coral" />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  accent,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  accent: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="nb-card flex items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn('nb-b grid h-10 w-10 shrink-0 place-items-center rounded-xl text-onaccent', accent)}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold">{title}</div>
          <div className="truncate text-xs font-medium text-muted">{description}</div>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label="Toggle notifications"
      className={cn(
        'nb-b relative h-7 w-12 shrink-0 rounded-full transition-colors',
        checked ? 'bg-acid' : 'bg-sunken'
      )}
    >
      <span
        className={cn(
          'nb-b absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function ProBadge() {
  return <span className="nb-chip bg-sun text-onaccent">Pro</span>;
}
