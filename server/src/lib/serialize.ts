import type { Contact, MeetingNote, Note, Task, TimelineEvent } from '../generated/prisma/client.js';

export type ContactWithRelations = Contact & { notes: Note[] };

export function serializeContact(c: ContactWithRelations) {
  return {
    id: c.id,
    name: c.name,
    photo: '',
    phone: c.phone,
    email: c.email,
    company: c.company,
    position: c.position,
    tags: c.tags ? c.tags.split(',').filter(Boolean) : [],
    location: c.location,
    birthday: c.birthday ? c.birthday.toISOString() : null,
    social: {
      linkedin: c.linkedin ?? undefined,
      twitter: c.twitter ?? undefined,
      instagram: c.instagram ?? undefined,
    },
    notes: c.notes.map((n) => n.text),
    aiSummary: c.aiSummary,
    lastInteraction: c.lastInteraction.toISOString(),
  };
}

export function serializeTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    contactId: t.contactId ?? undefined,
    status: t.status,
    dueDate: t.dueDate.toISOString(),
    source: t.source,
  };
}

export function serializeTimelineEvent(e: TimelineEvent) {
  return {
    id: e.id,
    contactId: e.contactId,
    type: e.type,
    date: e.date.toISOString(),
    summary: e.summary,
  };
}

export function serializeMeetingNote(m: MeetingNote) {
  return {
    id: m.id,
    contactId: m.contactId,
    rawTranscript: m.rawTranscript,
    summary: m.summary,
    actionItems: JSON.parse(m.actionItems) as string[],
    date: m.date.toISOString(),
  };
}

export function tagsToString(tags: unknown): string {
  if (Array.isArray(tags)) return tags.filter((t) => typeof t === 'string').join(',');
  if (typeof tags === 'string') return tags;
  return '';
}
