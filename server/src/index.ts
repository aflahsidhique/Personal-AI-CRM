import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { contactsRouter } from './routes/contacts.js';
import { timelineRouter } from './routes/timeline.js';
import { tasksRouter } from './routes/tasks.js';
import { meetingNotesRouter } from './routes/meetingNotes.js';
import { aiRouter } from './routes/ai.js';
import { OpenRouterError } from './lib/openrouter.js';
import { SarvamError } from './lib/sarvam.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    openrouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    sarvamConfigured: Boolean(process.env.SARVAM_API_KEY),
  })
);

app.use('/api/contacts', contactsRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/meeting-notes', meetingNotesRouter);
app.use('/api/ai', aiRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof OpenRouterError) {
    console.error('[OpenRouter]', err.message);
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof SarvamError) {
    console.error('[Sarvam]', err.message);
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Audio file is too large (maximum 25 MB)' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`AI Personal CRM API listening on http://localhost:${port}`);
});
