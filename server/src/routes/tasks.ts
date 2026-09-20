import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeTask } from '../lib/serialize.js';

export const tasksRouter = Router();

tasksRouter.get('/', async (_req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { dueDate: 'asc' } });
    res.json(tasks.map(serializeTask));
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.title) return res.status(400).json({ error: 'title is required' });
    const task = await prisma.task.create({
      data: {
        title: b.title,
        contactId: b.contactId || null,
        status: b.status ?? 'today',
        dueDate: b.dueDate ? new Date(b.dueDate) : new Date(),
        source: b.source ?? 'manual',
      },
    });
    res.status(201).json(serializeTask(task));
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch('/:id', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const data: Record<string, unknown> = {};
    if (b.title !== undefined) data.title = b.title;
    if (b.status !== undefined) data.status = b.status;
    if (b.dueDate !== undefined) data.dueDate = new Date(b.dueDate);
    if (b.contactId !== undefined) data.contactId = b.contactId || null;

    const task = await prisma.task.update({ where: { id: req.params.id }, data });
    res.json(serializeTask(task));
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
