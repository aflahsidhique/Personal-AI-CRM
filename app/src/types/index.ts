export type Tag =
  | 'Investor'
  | 'Client'
  | 'Friend'
  | 'Recruiter'
  | 'Startup'
  | 'Lead'
  | 'VIP'
  | 'Family';

export interface Contact {
  id: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  tags: Tag[];
  location: string;
  birthday: string | null; // ISO date, year is placeholder
  social: { linkedin?: string; twitter?: string; instagram?: string };
  notes: string[];
  aiSummary: string;
  lastInteraction: string; // ISO date
}

export type TimelineType =
  | 'call'
  | 'meeting'
  | 'whatsapp'
  | 'email'
  | 'note'
  | 'reminder'
  | 'voice';

export interface TimelineEvent {
  id: string;
  contactId: string;
  type: TimelineType;
  date: string; // ISO date
  summary: string;
}

export type TaskStatus = 'today' | 'upcoming' | 'done';

export interface Task {
  id: string;
  title: string;
  contactId?: string;
  status: TaskStatus;
  dueDate: string;
  source: 'manual' | 'ai';
}

export interface MeetingNote {
  id: string;
  contactId: string;
  rawTranscript: string;
  summary: string;
  actionItems: string[];
  date: string;
}
