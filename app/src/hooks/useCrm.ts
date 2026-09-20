import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ContactInput } from '@/lib/api';
import type { TaskStatus, TimelineType } from '@/types';

export function useHealth() {
  return useQuery({ queryKey: ['health'], queryFn: api.health, retry: false, staleTime: 30_000 });
}

export function useContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: api.contacts.list });
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => api.contacts.get(id as string),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactInput) => api.contacts.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactInput> }) => api.contacts.update(id, data),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['contacts', contact.id] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.contacts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => api.contacts.addNote(id, text),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['contacts', contact.id] });
    },
  });
}

export function useTimeline(contactId?: string) {
  return useQuery({
    queryKey: ['timeline', contactId ?? 'all'],
    queryFn: () => api.timeline.list(contactId),
  });
}

export function useAddTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contactId: string; type: TimelineType; summary: string; date?: string }) =>
      api.timeline.create(data),
    onSuccess: (event) => {
      qc.invalidateQueries({ queryKey: ['timeline'] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['contacts', event.contactId] });
    },
  });
}

export function useTasks() {
  return useQuery({ queryKey: ['tasks'], queryFn: api.tasks.list });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; contactId?: string; status?: TaskStatus; dueDate?: string; source?: 'manual' | 'ai' }) =>
      api.tasks.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.tasks.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useMeetingNotes(contactId?: string) {
  return useQuery({
    queryKey: ['meetingNotes', contactId ?? 'all'],
    queryFn: () => api.meetingNotes.list(contactId),
  });
}

export function useAddMeetingNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contactId: string; rawTranscript: string; summary: string; actionItems: string[]; date?: string }) =>
      api.meetingNotes.create(data),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ['meetingNotes'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['contacts', note.contactId] });
    },
  });
}

export function useTranscribeMeetingAudio() {
  return useMutation({
    mutationFn: ({ audio, fileName, languageCode }: { audio: Blob; fileName: string; languageCode?: string }) =>
      api.meetingNotes.transcribe(audio, fileName, languageCode),
  });
}

// ---------- AI ----------

export function useSummarizeMeeting() {
  return useMutation({ mutationFn: (rawTranscript: string) => api.ai.summarizeMeeting(rawTranscript) });
}

export function useExtractTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rawTranscript, contactId }: { rawTranscript: string; contactId?: string }) =>
      api.ai.extractTasks(rawTranscript, contactId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useRelationshipSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => api.ai.relationshipSummary(contactId),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      qc.invalidateQueries({ queryKey: ['contacts', contact.id] });
    },
  });
}

export function useFollowUp() {
  return useMutation({ mutationFn: (contactId: string) => api.ai.followUp(contactId) });
}

export function useConversationPrep() {
  return useMutation({ mutationFn: (contactId: string) => api.ai.conversationPrep(contactId) });
}

export function useDailyBrief() {
  return useQuery({ queryKey: ['dailyBrief'], queryFn: api.ai.dailyBrief, staleTime: 60_000 });
}

export function useSmartSearch() {
  return useMutation({ mutationFn: (query: string) => api.ai.smartSearch(query) });
}
