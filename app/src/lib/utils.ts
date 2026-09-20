import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Contact, Task, TimelineEvent } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export function daysBetween(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const days = daysBetween(iso);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Days until the next occurrence of a birthday (0 = today), ignoring the stored year. */
export function daysUntilBirthday(birthdayIso: string | null): number | null {
  if (!birthdayIso) return null;
  const today = new Date();
  const bday = new Date(birthdayIso);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  next.setHours(0, 0, 0, 0);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next.getTime() < t.getTime()) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Relationship health score: 40% recency of last interaction, 30% interaction
 * frequency (timeline volume), 20% completed tasks, 10% notes captured.
 */
export function computeRelationshipBreakdown(
  contact: Contact,
  timeline: TimelineEvent[],
  tasks: Task[]
): { recency: number; frequency: number; taskCompletion: number; notes: number; total: number } {
  const days = daysBetween(contact.lastInteraction);
  const recency = Math.round(Math.max(0, 100 - days * 1.5));

  const eventCount = timeline.filter((e) => e.contactId === contact.id).length;
  const frequency = Math.round(Math.min(100, eventCount * 14));

  const contactTasks = tasks.filter((t) => t.contactId === contact.id);
  const completed = contactTasks.filter((t) => t.status === 'done').length;
  const taskCompletion =
    contactTasks.length === 0 ? 50 : Math.round(Math.min(100, (completed / contactTasks.length) * 100));

  const notes = Math.round(Math.min(100, contact.notes.length * 20));

  const total = Math.round(
    Math.max(0, Math.min(100, recency * 0.4 + frequency * 0.3 + taskCompletion * 0.2 + notes * 0.1))
  );

  return { recency, frequency, taskCompletion, notes, total };
}

export function computeRelationshipScore(
  contact: Contact,
  timeline: TimelineEvent[],
  tasks: Task[]
): number {
  return computeRelationshipBreakdown(contact, timeline, tasks).total;
}

export function scoreLabel(score: number): 'Strong' | 'Medium' | 'Weak' {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Medium';
  return 'Weak';
}
