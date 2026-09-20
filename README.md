# AI Personal CRM

> A relationship memory layer for your network — contacts, timelines, meeting transcription, and AI that turns it all into things you should actually do today.

**[🚀 Live Demo](https://ai-crm-web-tb8l.onrender.com/)** · Neo-brutalist UI · Fully responsive · Voice-to-text in 23 languages

![Dashboard](docs/screenshots/01-dashboard.png)

---

## Overview

AI Personal CRM is a relationship-management workspace that helps people remember important details, stay on top of follow-ups, and prepare for conversations. It combines contact management, timelines, tasks, meeting notes, and AI-generated relationship intelligence in one responsive web application.

The application runs on a real PostgreSQL database and includes a React frontend, an Express API, OpenRouter-powered AI features, and Sarvam speech-to-text transcription for meeting audio.

## Problem Statement

Traditional CRMs are designed around sales pipelines and manual data entry. They are often too heavy for founders, freelancers, investors, community builders, and other people who simply need help maintaining meaningful professional relationships.

Important context becomes scattered across notes, messages, meetings, and memory. As a result, users forget personal details, miss follow-ups, lose track of commitments, and enter conversations without enough context.

## Solution

AI Personal CRM creates a lightweight memory layer for a user's network. It stores contact details, notes, interaction history, and tasks, then uses AI to turn that information into concise summaries and practical recommendations.

Users can record or upload meeting audio, transcribe it with Sarvam, summarize the transcript, extract action items, and save the result to the appropriate contact timeline. The assistant also provides daily priorities, natural-language contact search, follow-up suggestions, and conversation preparation.

---

## Screenshots

### Dashboard — AI daily brief, relationship stats, and suggestions

The brief is generated from your live CRM state: tasks due today, upcoming birthdays, and contacts who have gone cold. Suggestions are computed locally from interaction recency.

![Dashboard](docs/screenshots/01-dashboard.png)

### Contacts — searchable, tag-filterable directory

Every card carries a live relationship score derived from recency, meeting frequency, completed tasks, and notes.

![Contacts](docs/screenshots/02-contacts.png)

### Contact detail — AI memory, score breakdown, and timeline

Opening a contact generates a relationship summary from their stored notes and interaction history. The score breakdown shows exactly which signals produced the number.

![Contact detail](docs/screenshots/03-contact-detail.png)

### Meeting notes — transcript → AI summary → action items

Record a clip in-browser or upload one, transcribe it with Sarvam, then summarize and extract follow-up tasks in a single pass.

![Meeting notes](docs/screenshots/06-meeting-notes.png)

### AI assistant — natural-language search across your network

Ask in plain English. The assistant interprets the query against your CRM and returns matching contact cards.

![AI assistant](docs/screenshots/05-ai-assistant.png)

### Tasks — manual and AI-extracted follow-ups

![Tasks](docs/screenshots/04-tasks.png)

### Settings — live connection status

![Settings](docs/screenshots/07-settings.png)

### Light mode

The full neo-brutalist system — hard offset shadows, thick borders, flat accent fills — is built on themed tokens, so both modes are first-class.

![Light mode](docs/screenshots/08-contacts-light.png)

### Responsive down to 320px

Below `md`, the sidebar becomes a bottom tab bar and the task board turns into swipeable, scroll-snapped columns.

| Dashboard | Tasks |
| --- | --- |
| ![Mobile dashboard](docs/screenshots/09-mobile-dashboard.png) | ![Mobile tasks](docs/screenshots/10-mobile-tasks.png) |

---

## Demo

### Live Demo

**https://ai-crm-web-tb8l.onrender.com/**

> **Note on the hosted demo:** both the API and the database run on free tiers, which suspend when idle. The first request after a period of inactivity can take 30–60 seconds while the Render service and the Neon compute wake up. Subsequent requests are fast.

### Demo / Pitch Video

<!-- Paste the video link or embed here once generated. -->

_Coming soon._

The recommended demo flow is:

1. Create a contact and add relationship notes.
2. Generate an AI relationship summary.
3. Record or upload a meeting clip and transcribe it with Sarvam.
4. Generate a meeting summary and extract follow-up tasks.
5. Show the updated contact timeline, daily brief, and conversation preparation view.

---

## Features

- Contact profiles with company, role, location, tags, social links, personal notes, and interaction history
- AI-generated relationship summaries based on stored contact context
- Relationship scoring based on recency, interaction frequency, completed tasks, and notes
- Chronological timelines for calls, meetings, messages, notes, reminders, and voice interactions
- Manual and AI-extracted task management with today, upcoming, and completed states
- Meeting audio recording and file upload with Sarvam speech-to-text transcription
- Automatic language detection plus support for English and 22 Indic languages
- AI meeting summaries and action-item extraction
- Conversation preparation with suggested openings, questions, and useful personal details
- AI follow-up recommendations and a daily relationship brief
- Natural-language smart search across the contact directory
- Responsive neo-brutalist interface with light and dark themes
- Connection status indicators for the API server, OpenRouter, and Sarvam

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL (Neon serverless) with Prisma ORM and the `@prisma/adapter-pg` driver adapter
- **APIs / Services:** OpenRouter for AI generation, Sarvam AI for speech-to-text transcription
- **Hosting / Deployment:** Render — static site for the frontend, web service for the API, provisioned from `render.yaml`
- **Other Tools:** Codex, npm, Oxlint, Git

## Architecture

```
app/      React SPA (Vite)  ──HTTP──►  server/   Express API  ──Prisma──►  Neon Postgres
                                            │
                                            ├──►  OpenRouter  (summaries, briefs, smart search)
                                            └──►  Sarvam AI   (speech-to-text)
```

API keys live only on the server. The browser never sees them.

---

## Codex / OpenAI Usage

Codex was used as a collaborative development assistant throughout the build. It helped translate the initial product concept into a working full-stack architecture, generate and refine React components and Express routes, integrate Prisma, and connect the application to OpenRouter and Sarvam.

AI assistance was also used for:

- Product ideation and feature prioritization
- Frontend and backend architecture planning
- TypeScript and React code generation
- API integration and secure server-side key handling
- Debugging type, build, and data-flow issues
- Responsive UI/UX implementation
- Build validation and linting
- Project documentation

Within the product itself, OpenRouter models power meeting summaries, action-item extraction, relationship summaries, follow-up suggestions, conversation preparation, daily briefs, and smart contact search. Sarvam AI converts recorded or uploaded meeting audio into editable transcripts.

---

## How to Run Locally

### Prerequisites

- Node.js and npm
- A PostgreSQL connection string (a free [Neon](https://neon.tech) database works well)
- An OpenRouter API key for generative AI features
- A Sarvam API key for meeting audio transcription

### 1. Clone the repository

```bash
git clone <repo-url>
cd <project-folder>
```

### 2. Configure and run the backend

```bash
cd server
npm install
cp .env.example .env
```

Add your credentials to `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
PORT=4000

OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_MAX_TOKENS=800

SARVAM_API_KEY=your_sarvam_key
SARVAM_STT_MODEL=saaras:v3
```

Then apply the schema and start the server:

```bash
npx prisma migrate deploy
npm run dev
```

The backend runs at `http://localhost:4000`.

### 3. Install and run the frontend

Open a second terminal from the project root:

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173` in a browser and create the first contact.

### Production builds

```bash
cd server && npm run build
cd ../app && npm run build
```

---

## Deployment

The repository ships with a Render blueprint (`render.yaml`) that provisions both services:

| Service | Type | Root | Notes |
| --- | --- | --- | --- |
| `ai-crm-api` | Node web service | `server/` | Runs `prisma migrate deploy` on boot, health check at `/api/health` |
| `ai-crm-web` | Static site | `app/` | Vite build published from `dist`, SPA fallback routing |

To deploy: push the repository to GitHub, then in the Render dashboard choose **New → Blueprint**. You will be prompted for the secrets marked `sync: false` — `DATABASE_URL`, `OPENROUTER_API_KEY`, and `SARVAM_API_KEY`. None of them are committed to the repository.

The frontend reaches the API through `VITE_API_URL`, set to the deployed API service URL.

---

## Additional Notes

- CRUD features continue to work without API keys, but AI and transcription features require their respective services.
- `OPENROUTER_MAX_TOKENS` caps each completion. Without a cap, OpenRouter reserves the model's full context window and rejects requests with a `402` unless the account can afford the entire reservation.
- Sarvam's synchronous transcription endpoint accepts audio clips up to 30 seconds. The recorder stops automatically at 29 seconds, and multiple clips can be appended to one transcript.
- Meeting transcripts can be edited before they are summarized or saved.
- Relationship scores are calculated from current CRM data and are not stored as a fixed database value.
- Deleting a contact also removes its notes, timeline events, and meeting notes. Associated tasks are preserved with the contact reference cleared.
- Future improvements include long-form batch transcription with speaker diarization, calendar and email integrations, contact import/export, notifications, and native mobile applications.
