import express, { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeMeetingNote } from '../lib/serialize.js';
import { transcribeAudio } from '../lib/sarvam.js';

export const meetingNotesRouter = Router();

const supportedAudioTypes = new Set([
  'audio/aac',
  'audio/aiff',
  'audio/amr',
  'audio/flac',
  'audio/m4a',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/webm',
  'audio/x-aiff',
  'audio/x-m4a',
  'audio/x-ms-wma',
  'audio/x-wav',
  'video/mp4',
]);

meetingNotesRouter.post(
  '/transcribe',
  express.raw({ type: () => true, limit: '25mb' }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: 'An audio file is required' });
      }

      const mimeType = req.get('content-type')?.split(';')[0].toLowerCase() || 'application/octet-stream';
      if (mimeType !== 'application/octet-stream' && !supportedAudioTypes.has(mimeType)) {
        return res.status(415).json({ error: 'Unsupported audio format' });
      }

      const encodedName = req.get('x-file-name') || 'meeting-audio.webm';
      let decodedName = encodedName;
      try {
        decodedName = decodeURIComponent(encodedName);
      } catch {
        // Keep the original name when a client sends an invalid escape sequence.
      }
      const fileName = decodedName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-160) || 'meeting-audio.webm';
      const languageCode = typeof req.query.languageCode === 'string' ? req.query.languageCode : undefined;
      const result = await transcribeAudio(req.body, fileName, mimeType, languageCode);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

meetingNotesRouter.get('/', async (req, res, next) => {
  try {
    const contactId = typeof req.query.contactId === 'string' ? req.query.contactId : undefined;
    const notes = await prisma.meetingNote.findMany({
      where: contactId ? { contactId } : undefined,
      orderBy: { date: 'desc' },
    });
    res.json(notes.map(serializeMeetingNote));
  } catch (err) {
    next(err);
  }
});

meetingNotesRouter.post('/', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.contactId || !b.rawTranscript || !b.summary) {
      return res.status(400).json({ error: 'contactId, rawTranscript, and summary are required' });
    }
    const date = b.date ? new Date(b.date) : new Date();
    const note = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.findUniqueOrThrow({ where: { id: b.contactId } });
      const created = await tx.meetingNote.create({
        data: {
          contactId: b.contactId,
          rawTranscript: b.rawTranscript,
          summary: b.summary,
          actionItems: JSON.stringify(b.actionItems ?? []),
          date,
        },
      });
      await tx.timelineEvent.create({
        data: { contactId: b.contactId, type: 'voice', summary: b.summary, date },
      });
      if (date > contact.lastInteraction) {
        await tx.contact.update({ where: { id: b.contactId }, data: { lastInteraction: date } });
      }
      return created;
    });
    res.status(201).json(serializeMeetingNote(note));
  } catch (err) {
    next(err);
  }
});
