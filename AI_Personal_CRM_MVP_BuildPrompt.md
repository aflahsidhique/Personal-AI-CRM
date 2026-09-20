# AI Personal CRM — 60-Minute Pitch MVP Build Prompt

Paste this whole file to Claude Code as the task. It is self-contained: stack decision, exact
scaffold commands, data model, mock data, mock AI outputs, page-by-page spec, and a minute-by-minute
checkpoint schedule with a cut-list so the demo is guaranteed to be pitch-ready at the 60-minute mark
even if something runs long.

## Ground rule: why this differs from the original outline

The original spec (`AI_Personal_CRM_MVP_Claude_Code_Outline.md`) has a separate Express + MongoDB
backend and a live OpenRouter integration. That's the right shape for a real product, but it's the
wrong shape for a 60-minute pitch build: every extra process (DB connection, second dev server, API
key, network call during a live demo) is a new way for the demo to break in front of investors.

**Decision: build ONE Vite + React + TypeScript app. No backend process, no database, no network
calls during the demo.** All "backend" logic lives in-memory in the frontend (`src/data`, `src/ai`).
AI features are pre-written, realistic canned responses selected by simple keyword/context matching —
they must *look* like live AI output (typing/streaming animation, 600–1200ms simulated "thinking"
delay) but never depend on a network round trip. This is standard practice for investor-demo MVPs and
is what lets this ship in an hour with zero live-demo risk.

If there's time left after the P0/P1 checklist is done (see checkpoints), wire one single real
OpenRouter call behind a try/catch that falls back to the mock — but this is explicitly optional and
cut first if behind schedule.

---

## Tech Stack (final)

- Vite + React 18 + TypeScript
- React Router (hash or browser router, client-only)
- Tailwind CSS + shadcn/ui (cards, dialog, tabs, badge, progress, avatar, sheet, command palette)
- Framer Motion (page transitions, card hover, number count-up, progress rings)
- Lucide Icons
- Zustand (single in-memory store — simpler than React Query since there's no real backend/network)
- No auth, no router guards — app opens straight into the dashboard as "Demo User"

Skip: Node/Express, MongoDB, Firebase Auth, FCM, Google Calendar API. All listed under Future Vision
in the pitch instead of being built.

---

## Minute-by-Minute Plan with Checkpoints

Each checkpoint has a **cut-list** — if you're not at the checkpoint on time, drop the next item down
to P2 and move on. Never spend extra time polishing something not yet built.

| Time | Task | Checkpoint gate |
|---|---|---|
| 0–8 | Scaffold Vite+TS+Tailwind+shadcn, install deps, set up Tailwind theme (colors/fonts/radius), router shell, Sidebar + Header layout | App boots, empty routes render |
| 8–18 | Types (`src/types`), mock data generator (`src/data/seed.ts`) producing 20 contacts / 10 meetings / 40 tasks / 50 timeline events / 15 birthdays, Zustand store loading it | `console.log` of store shows correct counts |
| 18–20 | **Checkpoint A** | If behind: cut Import/Export CSV in Settings (P2) now |
| 20–34 | Dashboard page (stat cards, Daily Brief, AI Suggestions, upcoming birthdays/meetings) | Dashboard visually complete |
| 34–44 | Contacts list + Contact Detail page (profile header, AI Memory card, Timeline, Relationship Score) | Clicking a contact card opens full detail view |
| 44–46 | **Checkpoint B** | If behind: cut Meeting Notes voice-flow UI, keep Conversation Prep + Relationship Score (higher pitch impact) |
| 46–53 | Tasks (Kanban: Today/Upcoming/Done, drag optional — skip drag if tight), AI Assistant / Smart Search page with canned query→result mapping | Kanban renders with seeded tasks; typing a sample query returns filtered contacts |
| 53–57 | Conversation Prep panel (opens from Contact Detail before a "meeting"), Daily Brief detail | Prep panel shows last meeting summary + suggested opening line |
| 57–60 | **Checkpoint C**: dark mode toggle, page-transition polish, mobile breakpoint sanity check, final click-through of the pitch flow below | Full pitch flow works start to finish without console errors |

**Global cut-list (in order of what to drop if the clock wins):**
1. CSV import/export in Settings
2. Kanban drag-and-drop (keep as static columns with buttons to move status)
3. Voice-recording UI animation for Meeting Notes (keep the summary output, drop the mic waveform)
4. Real OpenRouter call (stay fully mocked)
5. Settings page beyond a static shell

Never cut: Dashboard, Contact Detail (AI Memory + Timeline + Relationship Score), Smart Search,
Conversation Prep. These four are what the pitch flow depends on.

---

## Folder Structure

```text
src/
├── main.tsx, App.tsx
├── layouts/AppLayout.tsx        (Sidebar + Header + Outlet)
├── components/
│   ├── Sidebar.tsx, Header.tsx, SearchBar.tsx
│   ├── DashboardCard.tsx, ContactCard.tsx, TimelineItem.tsx
│   ├── TaskCard.tsx, ReminderCard.tsx, AISuggestionCard.tsx
│   ├── RelationshipScore.tsx (progress ring), SummaryCard.tsx
│   ├── Avatar.tsx, TagBadge.tsx, TypingText.tsx (simulated AI streaming)
├── pages/
│   ├── Dashboard.tsx
│   ├── Contacts.tsx, ContactDetail.tsx
│   ├── Tasks.tsx
│   ├── MeetingNotes.tsx
│   ├── Assistant.tsx (Smart Search / AI chat)
│   ├── Settings.tsx
├── data/
│   ├── seed.ts        (generators for contacts/meetings/tasks/timeline/birthdays)
│   └── store.ts        (Zustand store)
├── ai/
│   ├── mockAI.ts       (all AI_FEATURES functions below)
│   └── canned/          (per-feature response templates keyed by contact/tag)
├── types/index.ts
└── lib/utils.ts (cn helper, date formatting, relationship score calc)
```

---

## Data Model (`src/types/index.ts`)

```ts
type Tag = 'Investor'|'Client'|'Friend'|'Recruiter'|'Startup'|'Lead'|'VIP'|'Family';

interface Contact {
  id: string; name: string; photo: string; phone: string; email: string;
  company: string; position: string; tags: Tag[]; location: string;
  birthday: string; // ISO date
  social: { linkedin?: string; twitter?: string; instagram?: string };
  notes: string[];              // raw AI Memory fragments, e.g. "Likes football", "Has two kids"
  aiSummary: string;            // generated relationship summary paragraph
  relationshipScore: number;    // 0-100, derived
  lastInteraction: string;      // ISO date
}

interface TimelineEvent {
  id: string; contactId: string; type: 'call'|'meeting'|'whatsapp'|'email'|'note'|'reminder'|'voice';
  date: string; summary: string; tags?: string[];
}

interface Task {
  id: string; title: string; contactId?: string; status: 'today'|'upcoming'|'done';
  dueDate: string; source: 'manual'|'ai';
}

interface MeetingNote {
  id: string; contactId: string; rawTranscript: string; summary: string;
  actionItems: string[]; date: string;
}
```

---

## Mock Data Generation (`src/data/seed.ts`)

Generate deterministically (fixed seed array, not `Math.random()` names) so the demo is repeatable:

- **20 contacts** — mix of tags (Investor ×3, Client ×5, Lead ×4, Recruiter ×2, Friend ×3, VIP ×2,
  Startup ×1), spread across cities (Dubai, Bangalore, Mumbai, Delhi, London, SF) so "Clients from
  Dubai" and similar smart-search demos return non-trivial results. Give 3–4 contacts a
  `lastInteraction` > 90 days ago (cold contacts), 2 with birthdays in the next 3 days, and one
  ("Rahul") with a rich note history for the Conversation Prep demo.
- **10 meetings**, **40 tasks** (roughly 8 today / 20 upcoming / 12 done), **50 timeline events**
  distributed across contacts (weight toward the 5–6 "hero" contacts used in the pitch so their
  detail pages feel alive), **15 birthdays** derived from contact birthdays + a few extra.
- Hero contacts to hand-write richly (used in the scripted pitch flow): **Rahul** (startup founder,
  Flutter app, ₹4L budget, son started college), **John** (investor, football, AI-interested, has two
  kids, travels frequently), **Anjali** (birthday tomorrow), **Sarah** (3 PM meeting today).

---

## Mock AI Functions (`src/ai/mockAI.ts`)

Each takes a contact/context and returns a canned-but-contextual result from a lookup table, with an
`await delay(600–1200)` to simulate latency, and export a version wrapped for the `TypingText`
component to stream character-by-character.

```ts
summarizeMeeting(rawText: string): Promise<{ summary: string; actionItems: string[] }>
extractTasks(rawText: string): Promise<Task[]>
relationshipSummary(contact: Contact): Promise<string>
followUpSuggestion(contact: Contact): Promise<{ message: string; suggestedDate: string }>
dailyBrief(contacts: Contact[], tasks: Task[]): Promise<string[]>   // bullet list
conversationPrep(contact: Contact): Promise<{ lastMeeting: string; personalDetails: string[]; suggestedOpening: string; suggestedQuestions: string[] }>
smartSearch(query: string, contacts: Contact[]): Contact[]           // keyword/tag matcher, see below
```

`smartSearch` implementation: lowercase the query, match against a keyword→filter map so these exact
demo prompts work reliably:
- "interested in ai" → contacts with `notes` containing "AI"
- "clients from dubai" → tag `Client` AND `location === 'Dubai'`
- "people i met last month" → `lastInteraction` within last 30 days
- "who should i follow up with" / "cold contacts" → `lastInteraction` > 90 days ago
- fallback: naive substring match across name/company/tags/notes

Example canned JSON shape (matches original spec):
```json
{ "summary": "...", "tasks": [], "followup": "...", "reminder": "..." }
```

---

## Pages — Priority-Tagged

**P0 (never cut):**
- **Dashboard**: 5 stat cards (Contacts, Follow-ups Due, Birthdays, Meetings Today, Tasks Today) with
  count-up animation → Daily Brief card (AI-voiced bullet list) → AI Suggestions row → upcoming
  birthdays/meetings strip.
- **Contacts**: grid of `ContactCard` (photo, name, company, tags, relationship score ring), search +
  tag filter bar.
- **Contact Detail**: profile header → **AI Memory** card (raw notes rendered as chips, then the AI
  summary paragraph below with a "regenerate" button that re-runs the mock streaming animation) →
  **Timeline** (chronological, icon per event type) → **Relationship Score** ring with the 4-factor
  breakdown → **Conversation Prep** button opening a side sheet.
- **Assistant / Smart Search**: chat-style input, 5 clickable example prompts (from the list above),
  results render as a `ContactCard` grid under the answer.

**P1:**
- **Tasks**: Kanban (Today/Upcoming/Done), AI-sourced tasks show a small sparkle badge.
- **Meeting Notes**: paste/record-simulated transcript → Summarize → Extract Tasks → Save, writes into
  the contact's timeline live.

**P2 (build only if ahead of schedule):**
- **Settings**: theme toggle (wire to real dark mode), static Import/Export/API-key rows (non-functional,
  labeled "Pro").

---

## Design System

- Palette: indigo/purple → blue gradient primary (`from-indigo-600 to-blue-500`), neutral slate
  surfaces, emerald for positive relationship score, amber for follow-ups due, rose for cold contacts.
- Cards: `rounded-2xl`, soft shadow, subtle glass effect on dashboard hero cards
  (`bg-white/70 dark:bg-slate-900/60 backdrop-blur`).
- Motion: page fade/slide-up on route change, stagger-in on card grids, count-up on stat numbers,
  progress-ring animates to value on mount, `TypingText` streams AI copy at ~18ms/char.
- Dark mode default (feels more "AI product" for a pitch); toggle in Header.
- Fully responsive down to a single-column mobile layout — the Flutter app is future scope, but the
  web MVP should not look broken on a laptop projector *or* a phone if an investor asks to hold it.

---

## Pitch Flow (script to rehearse in the last 5 minutes)

1. **Dashboard** — "Here's my morning: 4 follow-ups due, 2 birthdays, 5 meetings. AI already told me
   what matters today." (point at Daily Brief)
2. **Contact Detail → Rahul** — "I don't write structured notes. I just type what I remember." (show
   raw AI Memory chips) "AI turns that into a relationship summary." (show `aiSummary`, regenerate
   with streaming animation for effect)
3. **Timeline** — scroll Rahul's timeline: call → meeting → note → WhatsApp, all in one chronological
   view.
4. **Meeting Notes** — paste a rough transcript, hit Summarize → Extract Tasks, watch it land in
   Rahul's timeline and the Tasks board simultaneously.
5. **Assistant / Smart Search** — click "Clients from Dubai" and "People interested in AI" prompts
   live.
6. **Conversation Prep** — open it for Rahul: "Before I even join the call, AI reminds me his son
   started college, and to ask about that first."
7. **Future Vision** — close on the Settings/Pro tier screen: Gmail/WhatsApp/LinkedIn enrichment,
   business card scanner, Flutter app — "this is the wedge into a much bigger relationship-intelligence
   product."

---

## Success Criteria (unchanged from original spec)

The MVP must clearly demonstrate, without any network dependency risk:
- AI remembers every relationship (AI Memory + summary)
- AI recommends follow-ups (Daily Brief, follow-up suggestions)
- AI summarizes meetings (Meeting Notes flow)
- AI prepares conversations (Conversation Prep)
- The product feels polished and investor-ready (motion, dark mode, gradient/glass design)
