import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { chatComplete, chatCompleteJSON } from '../lib/openrouter.js';
import { serializeContact, serializeTask } from '../lib/serialize.js';
import { daysBetween, daysUntilBirthday } from '../lib/dates.js';

export const aiRouter = Router();

const includeNotes = { notes: { orderBy: { createdAt: 'asc' as const } } };

// ---------- Meeting Notes ----------

aiRouter.post('/summarize-meeting', async (req, res, next) => {
  try {
    const rawTranscript: string = req.body?.rawTranscript ?? '';
    if (!rawTranscript.trim()) return res.status(400).json({ error: 'rawTranscript is required' });

    const result = await chatCompleteJSON<{ summary: string; actionItems: string[] }>({
      system:
        'You summarize rough voice-to-text meeting transcripts for a personal CRM. ' +
        'Respond ONLY with JSON: {"summary": string, "actionItems": string[]}. ' +
        'Summary should be 1-2 sentences. Action items should be short, concrete, imperative tasks (3-5 items).',
      user: rawTranscript,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/extract-tasks', async (req, res, next) => {
  try {
    const rawTranscript: string = req.body?.rawTranscript ?? '';
    const contactId: string | undefined = req.body?.contactId || undefined;
    if (!rawTranscript.trim()) return res.status(400).json({ error: 'rawTranscript is required' });

    const { actionItems } = await chatCompleteJSON<{ actionItems: string[] }>({
      system:
        'Extract concrete follow-up tasks from this meeting transcript for a personal CRM. ' +
        'Respond ONLY with JSON: {"actionItems": string[]}, 3-5 short imperative tasks.',
      user: rawTranscript,
    });

    const created = await prisma.$transaction(
      actionItems.map((title) =>
        prisma.task.create({
          data: { title, contactId: contactId || null, status: 'today', source: 'ai' },
        })
      )
    );
    res.status(201).json(created.map(serializeTask));
  } catch (err) {
    next(err);
  }
});

// ---------- Contact intelligence ----------

aiRouter.post('/relationship-summary', async (req, res, next) => {
  try {
    const contactId: string = req.body?.contactId;
    const contact = await prisma.contact.findUnique({ where: { id: contactId }, include: includeNotes });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const summary = await chatComplete({
      system:
        'You write a short (2-4 sentence) relationship-intelligence summary for a personal CRM, based on raw notes ' +
        'someone jotted down about a contact. Mention their role/context, why they matter (client/investor/lead/friend etc.), ' +
        'and one concrete, useful detail worth remembering. Write in plain prose, no headers or bullet points.',
      user: `Name: ${contact.name}\nCompany: ${contact.company}\nPosition: ${contact.position}\nTags: ${contact.tags}\nLocation: ${contact.location}\nRaw notes:\n${contact.notes.map((n) => `- ${n.text}`).join('\n') || '(none yet)'}`,
    });

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: { aiSummary: summary.trim() },
      include: includeNotes,
    });
    res.json(serializeContact(updated));
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/follow-up', async (req, res, next) => {
  try {
    const contactId: string = req.body?.contactId;
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const days = daysBetween(contact.lastInteraction);
    const result = await chatCompleteJSON<{ message: string; suggestedInDays: number }>({
      system:
        'Given how many days since the last interaction with a CRM contact, respond ONLY with JSON: ' +
        '{"message": string, "suggestedInDays": number}. The message is a short, direct recommendation ' +
        '(1 sentence) on whether/when to follow up. suggestedInDays is when the next touchpoint should happen (0 = today).',
      user: `Contact: ${contact.name}, ${days} days since last interaction, tags: ${contact.tags}.`,
    });

    const suggestedDate = new Date();
    suggestedDate.setDate(suggestedDate.getDate() + Math.max(0, result.suggestedInDays ?? 14));
    res.json({ message: result.message, suggestedDate: suggestedDate.toISOString() });
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/conversation-prep', async (req, res, next) => {
  try {
    const contactId: string = req.body?.contactId;
    const contact = await prisma.contact.findUnique({ where: { id: contactId }, include: includeNotes });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const events = await prisma.timelineEvent.findMany({
      where: { contactId },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const result = await chatCompleteJSON<{
      lastMeeting: string;
      personalDetails: string[];
      suggestedOpening: string;
      suggestedQuestions: string[];
    }>({
      system:
        'You prepare someone for an upcoming conversation with a CRM contact. Respond ONLY with JSON: ' +
        '{"lastMeeting": string, "personalDetails": string[], "suggestedOpening": string, "suggestedQuestions": string[]}. ' +
        'lastMeeting summarizes the most recent interaction in one sentence (or says none logged). ' +
        'personalDetails is 1-3 short non-business facts worth remembering. suggestedOpening is one warm, specific opening line. ' +
        'suggestedQuestions is 2-3 good questions to ask.',
      user: `Name: ${contact.name}\nNotes:\n${contact.notes.map((n) => `- ${n.text}`).join('\n') || '(none)'}\nRecent timeline:\n${events.map((e) => `- [${e.type}] ${e.summary}`).join('\n') || '(none)'}`,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------- Network-wide intelligence ----------

aiRouter.post('/daily-brief', async (_req, res, next) => {
  try {
    const [contacts, todayTasks] = await Promise.all([
      prisma.contact.findMany(),
      prisma.task.findMany({ where: { status: 'today' } }),
    ]);

    const coldContacts = contacts.filter((c) => daysBetween(c.lastInteraction) > 90);
    const upcomingBirthdays = contacts.filter((c) => {
      const d = daysUntilBirthday(c.birthday);
      return d !== null && d <= 3;
    });

    const context = [
      `Tasks due today: ${todayTasks.map((t) => t.title).join('; ') || 'none'}`,
      `Contacts with birthdays in the next 3 days: ${upcomingBirthdays.map((c) => c.name).join(', ') || 'none'}`,
      `Contacts not spoken to in 90+ days: ${coldContacts.map((c) => c.name).join(', ') || 'none'}`,
      `Total contacts: ${contacts.length}`,
    ].join('\n');

    const result = await chatCompleteJSON<{ items: string[] }>({
      system:
        'You write a short morning briefing for a personal CRM app. Respond ONLY with JSON: {"items": string[]}, ' +
        '3-6 short, punchy priority bullets (no markdown), based on the given context. If context says "none" for a category, skip it.',
      user: context,
    });
    res.json(result.items ?? []);
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/smart-search', async (req, res, next) => {
  try {
    const query: string = req.body?.query ?? '';
    if (!query.trim()) return res.json({ message: '', results: [] });

    const contacts = await prisma.contact.findMany({ include: includeNotes });
    if (contacts.length === 0) return res.json({ message: 'No contacts yet.', results: [] });

    const directory = contacts.map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      location: c.location,
      tags: c.tags,
      daysSinceLastInteraction: daysBetween(c.lastInteraction),
      notes: c.notes.map((n) => n.text),
    }));

    const result = await chatCompleteJSON<{ ids: string[]; message: string }>({
      system:
        'You are a smart search engine over a personal CRM contact directory (JSON array below). ' +
        'Given a natural-language query, respond ONLY with JSON: {"ids": string[], "message": string}. ' +
        '"ids" are the matching contact ids from the directory, best matches first. "message" is a short ' +
        '(under 15 words) description of what was found, e.g. "Found 3 clients based in Dubai".',
      user: `Directory:\n${JSON.stringify(directory)}\n\nQuery: ${query}`,
    });

    const byId = new Map(contacts.map((c) => [c.id, c]));
    const ordered = (result.ids ?? []).map((id) => byId.get(id)).filter((c): c is (typeof contacts)[number] => Boolean(c));

    res.json({ message: result.message ?? '', results: ordered.map(serializeContact) });
  } catch (err) {
    next(err);
  }
});
