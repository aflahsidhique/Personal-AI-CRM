import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeTimelineEvent } from '../lib/serialize.js';

export const timelineRouter = Router();

timelineRouter.get('/', async (req, res, next) => {
  try {
    const contactId = typeof req.query.contactId === 'string' ? req.query.contactId : undefined;
    const events = await prisma.timelineEvent.findMany({
      where: contactId ? { contactId } : undefined,
      orderBy: { date: 'desc' },
    });
    res.json(events.map(serializeTimelineEvent));
  } catch (err) {
    next(err);
  }
});

timelineRouter.post('/', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.contactId || !b.type || !b.summary) {
      return res.status(400).json({ error: 'contactId, type, and summary are required' });
    }
    const date = b.date ? new Date(b.date) : new Date();
    const event = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.findUniqueOrThrow({ where: { id: b.contactId } });
      const created = await tx.timelineEvent.create({
        data: { contactId: b.contactId, type: b.type, summary: b.summary, date },
      });
      if (date > contact.lastInteraction) {
        await tx.contact.update({ where: { id: b.contactId }, data: { lastInteraction: date } });
      }
      return created;
    });
    res.status(201).json(serializeTimelineEvent(event));
  } catch (err) {
    next(err);
  }
});
