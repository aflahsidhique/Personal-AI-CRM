import type { Contact, MeetingNote, Task, TaskStatus, TimelineEvent, TimelineType } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ContactInput {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  position?: string;
  tags?: string[];
  location?: string;
  birthday?: string | null;
  social?: { linkedin?: string; twitter?: string; instagram?: string };
  notes?: string[];
}

export const api = {
  health: () => request<{ ok: boolean; openrouterConfigured: boolean; sarvamConfigured: boolean }>('/health'),
  contacts: {
    list: () => request<Contact[]>('/contacts'),
    get: (id: string) => request<Contact>(`/contacts/${id}`),
    create: (data: ContactInput) => request<Contact>('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ContactInput>) =>
      request<Contact>(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
    addNote: (id: string, text: string) =>
      request<Contact>(`/contacts/${id}/notes`, { method: 'POST', body: JSON.stringify({ text }) }),
  },
  timeline: {
    list: (contactId?: string) => request<TimelineEvent[]>(`/timeline${contactId ? `?contactId=${contactId}` : ''}`),
    create: (data: { contactId: string; type: TimelineType; summary: string; date?: string }) =>
      request<TimelineEvent>('/timeline', { method: 'POST', body: JSON.stringify(data) }),
  },
  tasks: {
    list: () => request<Task[]>('/tasks'),
    create: (data: { title: string; contactId?: string; status?: TaskStatus; dueDate?: string; source?: 'manual' | 'ai' }) =>
      request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: TaskStatus) =>
      request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  meetingNotes: {
    list: (contactId?: string) => request<MeetingNote[]>(`/meeting-notes${contactId ? `?contactId=${contactId}` : ''}`),
    create: (data: { contactId: string; rawTranscript: string; summary: string; actionItems: string[]; date?: string }) =>
      request<MeetingNote>('/meeting-notes', { method: 'POST', body: JSON.stringify(data) }),
    transcribe: (audio: Blob, fileName: string, languageCode = 'unknown') =>
      request<{ transcript: string; languageCode: string | null; requestId: string | null }>(
        `/meeting-notes/transcribe?languageCode=${encodeURIComponent(languageCode)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': audio.type || 'application/octet-stream',
            'X-File-Name': encodeURIComponent(fileName),
          },
          body: audio,
        },
      ),
  },
  ai: {
    summarizeMeeting: (rawTranscript: string) =>
      request<{ summary: string; actionItems: string[] }>('/ai/summarize-meeting', {
        method: 'POST',
        body: JSON.stringify({ rawTranscript }),
      }),
    extractTasks: (rawTranscript: string, contactId?: string) =>
      request<Task[]>('/ai/extract-tasks', { method: 'POST', body: JSON.stringify({ rawTranscript, contactId }) }),
    relationshipSummary: (contactId: string) =>
      request<Contact>('/ai/relationship-summary', { method: 'POST', body: JSON.stringify({ contactId }) }),
    followUp: (contactId: string) =>
      request<{ message: string; suggestedDate: string }>('/ai/follow-up', {
        method: 'POST',
        body: JSON.stringify({ contactId }),
      }),
    conversationPrep: (contactId: string) =>
      request<{
        lastMeeting: string;
        personalDetails: string[];
        suggestedOpening: string;
        suggestedQuestions: string[];
      }>('/ai/conversation-prep', { method: 'POST', body: JSON.stringify({ contactId }) }),
    dailyBrief: () => request<string[]>('/ai/daily-brief', { method: 'POST' }),
    smartSearch: (query: string) =>
      request<{ message: string; results: Contact[] }>('/ai/smart-search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
  },
};
