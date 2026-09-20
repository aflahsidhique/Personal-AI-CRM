import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeContact, tagsToString } from '../lib/serialize.js';

export const contactsRouter = Router();

const includeNotes = { notes: { orderBy: { createdAt: 'asc' as const } } };

contactsRouter.get('/', async (_req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: includeNotes,
      orderBy: { name: 'asc' },
    });
    res.json(contacts.map(serializeContact));
  } catch (err) {
    next(err);
  }
});

contactsRouter.get('/:id', async (req, res, next) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: includeNotes,
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(serializeContact(contact));
  } catch (err) {
    next(err);
  }
});

contactsRouter.post('/', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.name || typeof b.name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }
    const contact = await prisma.contact.create({
      data: {
        name: b.name,
        phone: b.phone ?? '',
        email: b.email ?? '',
        company: b.company ?? '',
        position: b.position ?? '',
        tags: tagsToString(b.tags),
        location: b.location ?? '',
        birthday: b.birthday ? new Date(b.birthday) : null,
        linkedin: b.social?.linkedin || null,
        twitter: b.social?.twitter || null,
        instagram: b.social?.instagram || null,
        aiSummary: b.aiSummary ?? '',
        lastInteraction: b.lastInteraction ? new Date(b.lastInteraction) : new Date(),
        notes: b.notes?.length
          ? { create: (b.notes as string[]).map((text) => ({ text })) }
          : undefined,
      },
      include: includeNotes,
    });
    res.status(201).json(serializeContact(contact));
  } catch (err) {
    next(err);
  }
});

contactsRouter.patch('/:id', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const data: Record<string, unknown> = {};
    for (const field of ['name', 'phone', 'email', 'company', 'position', 'location', 'aiSummary'] as const) {
      if (b[field] !== undefined) data[field] = b[field];
    }
    if (b.tags !== undefined) data.tags = tagsToString(b.tags);
    if (b.birthday !== undefined) data.birthday = b.birthday ? new Date(b.birthday) : null;
    if (b.lastInteraction !== undefined) data.lastInteraction = new Date(b.lastInteraction);
    if (b.social !== undefined) {
      data.linkedin = b.social.linkedin || null;
      data.twitter = b.social.twitter || null;
      data.instagram = b.social.instagram || null;
    }

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data,
      include: includeNotes,
    });
    res.json(serializeContact(contact));
  } catch (err) {
    next(err);
  }
});

contactsRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

contactsRouter.post('/:id/notes', async (req, res, next) => {
  try {
    const text = (req.body?.text ?? '').trim();
    if (!text) return res.status(400).json({ error: 'text is required' });
    await prisma.note.create({ data: { contactId: req.params.id, text } });
    const contact = await prisma.contact.findUniqueOrThrow({
      where: { id: req.params.id },
      include: includeNotes,
    });
    res.status(201).json(serializeContact(contact));
  } catch (err) {
    next(err);
  }
});
