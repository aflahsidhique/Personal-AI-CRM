import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, Cake, CalendarDays, ListChecks, Sparkles, UserPlus, ArrowRight } from 'lucide-react';
import { useContacts, useTasks, useTimeline, useDailyBrief } from '@/hooks/useCrm';
import { daysBetween, daysUntilBirthday } from '@/lib/utils';
import DashboardCard from '@/components/DashboardCard';
import AISuggestionCard from '@/components/AISuggestionCard';
import ContactCard from '@/components/ContactCard';
import TypingText from '@/components/TypingText';
import Avatar from '@/components/Avatar';

export default function Dashboard() {
  const { data: contacts = [], isLoading: contactsLoading } = useContacts();
  const { data: tasks = [] } = useTasks();
  const { data: timeline = [] } = useTimeline();
  const { data: brief, isLoading: briefLoading, isError: briefError } = useDailyBrief();

  const todayTasks = tasks.filter((t) => t.status === 'today');
  const followUpsDue = contacts.filter((c) => daysBetween(c.lastInteraction) > 30).length;
  const upcomingBirthdays = contacts.filter((c) => {
    const d = daysUntilBirthday(c.birthday);
    return d !== null && d <= 7;
  });
  const meetingsToday = timeline.filter(
    (e) => daysBetween(e.date) === 0 && (e.type === 'meeting' || e.type === 'reminder' || e.type === 'call')
  );

  const coldContacts = contacts
    .filter((c) => daysBetween(c.lastInteraction) > 90)
    .sort((a, b) => daysBetween(b.lastInteraction) - daysBetween(a.lastInteraction));

  const suggestions = [
    coldContacts[0] &&
      `You haven't talked to ${coldContacts[0].name.split(' ')[0]} in ${Math.floor(daysBetween(coldContacts[0].lastInteraction) / 30)} months. Reach out today.`,
    upcomingBirthdays[0] &&
      (() => {
        const d = daysUntilBirthday(upcomingBirthdays[0].birthday)!;
        return `${upcomingBirthdays[0].name.split(' ')[0]}'s birthday is ${d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`}.`;
      })(),
    coldContacts[1] && `${coldContacts[1].name.split(' ')[0]} looks like a cold lead — worth a quick check-in.`,
  ].filter(Boolean) as string[];

  const recentContactIds = new Set(
    [...timeline.slice(0, 20).map((e) => e.contactId), ...todayTasks.map((t) => t.contactId)].filter(Boolean)
  );
  const heroContacts = contacts
    .filter((c) => recentContactIds.has(c.id))
    .concat(contacts)
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 4);

  if (!contactsLoading && contacts.length === 0) {
    return (
      <div className="nb-card mx-auto mt-6 flex max-w-md flex-col items-center gap-4 p-6 text-center sm:p-10">
        <div className="nb-b nb-sh grid h-16 w-16 place-items-center rounded-2xl bg-acid text-onaccent">
          <UserPlus size={26} strokeWidth={2.6} />
        </div>
        <div>
          <h1 className="nb-display text-xl sm:text-2xl">Welcome to your AI CRM</h1>
          <p className="mt-2 text-sm font-medium text-muted">
            Add your first contact to see your dashboard come alive.
          </p>
        </div>
        <Link to="/contacts" className="nb-btn bg-acid text-onaccent">
          Add a Contact <ArrowRight size={15} strokeWidth={2.8} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="nb-display text-2xl sm:text-4xl">Good Morning 👋</h1>
        <p className="mt-1 text-sm font-medium text-muted">Here's what matters today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        <DashboardCard label="Contacts" value={contacts.length} icon={<Users size={18} strokeWidth={2.6} />} accent="bg-acid" />
        <DashboardCard label="Follow-ups" value={followUpsDue} icon={<Clock size={18} strokeWidth={2.6} />} accent="bg-sun" />
        <DashboardCard label="Birthdays" value={upcomingBirthdays.length} icon={<Cake size={18} strokeWidth={2.6} />} accent="bg-bubble" />
        <DashboardCard label="Meetings" value={meetingsToday.length} icon={<CalendarDays size={18} strokeWidth={2.6} />} accent="bg-aqua" />
        <DashboardCard
          label="Tasks Today"
          value={todayTasks.length}
          icon={<ListChecks size={18} strokeWidth={2.6} />}
          accent="bg-mint max-sm:col-span-2"
        />
      </div>

      {/* Brief + suggestions */}
      <div className="grid gap-4 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="nb-card p-4 sm:p-5 lg:col-span-3"
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="nb-b grid h-8 w-8 place-items-center rounded-lg bg-lav text-onaccent">
              <Sparkles size={15} strokeWidth={2.6} />
            </div>
            <h2 className="nb-display text-base sm:text-lg">AI Daily Brief</h2>
          </div>

          {briefLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded border-2 border-ink bg-sunken"
                  style={{ width: `${80 - i * 8}%` }}
                />
              ))}
            </div>
          ) : briefError ? (
            <p className="nb-card-flat bg-sun p-3 text-sm font-bold text-onaccent">
              AI brief unavailable — check that the server is running and OPENROUTER_API_KEY is set.
            </p>
          ) : !brief || brief.length === 0 ? (
            <p className="text-sm font-medium text-muted">All caught up — nothing urgent today.</p>
          ) : (
            <ul className="space-y-3">
              {brief.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2.5 text-sm font-medium"
                >
                  <span className="nb-b mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-acid text-[10px] font-bold text-onaccent">
                    {i + 1}
                  </span>
                  {i === 0 ? <TypingText text={item} /> : <span>{item}</span>}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2.5 lg:col-span-2"
        >
          <h2 className="nb-label text-muted">AI Suggestions</h2>
          {suggestions.length === 0 ? (
            <p className="text-sm font-medium text-muted">Nothing urgent — your network looks warm.</p>
          ) : (
            suggestions.map((s) => <AISuggestionCard key={s} text={s} />)
          )}
        </motion.div>
      </div>

      {/* People */}
      {heroContacts.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="nb-display text-lg sm:text-xl">Today's People</h2>
            <Link to="/contacts" className="nb-btn px-2.5 py-1 text-[11px]">
              View all <ArrowRight size={12} strokeWidth={2.8} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {heroContacts.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        </div>
      )}

      {/* Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div>
          <h2 className="nb-display mb-3 text-lg sm:text-xl">Upcoming Birthdays</h2>
          <div className="flex flex-wrap gap-3">
            {upcomingBirthdays.map((c) => {
              const d = daysUntilBirthday(c.birthday)!;
              return (
                <Link key={c.id} to={`/contacts/${c.id}`} className="nb-card nb-lift flex items-center gap-2.5 p-2.5">
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{c.name}</div>
                    <div className="nb-label text-muted">
                      {d === 0 ? 'Today 🎂' : d === 1 ? 'Tomorrow' : `In ${d} days`}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
