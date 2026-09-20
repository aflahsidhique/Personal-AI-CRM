import { Phone, Users, MessageCircle, Mail, StickyNote, Bell, Mic } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { formatDateTime } from '@/lib/utils';

const ICONS: Record<TimelineEvent['type'], typeof Phone> = {
  call: Phone,
  meeting: Users,
  whatsapp: MessageCircle,
  email: Mail,
  note: StickyNote,
  reminder: Bell,
  voice: Mic,
};

const COLORS: Record<TimelineEvent['type'], string> = {
  call: 'bg-aqua',
  meeting: 'bg-lav',
  whatsapp: 'bg-mint',
  email: 'bg-sun',
  note: 'bg-surface',
  reminder: 'bg-coral',
  voice: 'bg-bubble',
};

export default function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast?: boolean }) {
  const Icon = ICONS[event.type];
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`nb-b grid h-9 w-9 shrink-0 place-items-center rounded-lg text-onaccent ${COLORS[event.type]}`}
        >
          <Icon size={15} strokeWidth={2.6} />
        </div>
        {!isLast && <div className="mt-1 w-0.5 flex-1 bg-ink/30" />}
      </div>
      <div className="min-w-0 pb-5">
        <div className="nb-label text-muted">
          {event.type} · {formatDateTime(event.date)}
        </div>
        <div className="mt-0.5 text-sm font-medium">{event.summary}</div>
      </div>
    </div>
  );
}
