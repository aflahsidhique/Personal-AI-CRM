# AI Personal CRM

## Overview

AI Personal CRM is a relationship-management workspace that helps people remember important details, stay on top of follow-ups, and prepare for conversations. It combines contact management, timelines, tasks, meeting notes, and AI-generated relationship intelligence in one responsive web application.

The application uses a real SQLite database and includes a React frontend, an Express API, OpenRouter-powered AI features, and Sarvam speech-to-text transcription for meeting audio.

## Problem Statement

Traditional CRMs are designed around sales pipelines and manual data entry. They are often too heavy for founders, freelancers, investors, community builders, and other people who simply need help maintaining meaningful professional relationships.

Important context becomes scattered across notes, messages, meetings, and memory. As a result, users forget personal details, miss follow-ups, lose track of commitments, and enter conversations without enough context.

## Solution

AI Personal CRM creates a lightweight memory layer for a user's network. It stores contact details, notes, interaction history, and tasks, then uses AI to turn that information into concise summaries and practical recommendations.

Users can record or upload meeting audio, transcribe it with Sarvam, summarize the transcript, extract action items, and save the result to the appropriate contact timeline. The assistant also provides daily priorities, natural-language contact search, follow-up suggestions, and conversation preparation.

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
- Responsive mobile and desktop interface with light and dark themes
- Connection status indicators for the API server, OpenRouter, and Sarvam

## Tech Stack

- *Frontend:* React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS, Framer Motion, Lucide React
- *Backend:* Node.js, Express 5, TypeScript
- *Database:* SQLite with Prisma ORM and the Better SQLite3 adapter
- *APIs / Services:* OpenRouter for AI generation and Sarvam AI for speech-to-text transcription
- *Hosting / Deployment:* Not deployed yet; the frontend and backend currently run locally
- *Other Tools:* Codex, npm, ESLint-compatible Oxlint, Git

## Codex / OpenAI Usage

Codex was used as a collaborative development assistant throughout the build. It helped translate the initial product concept into a working full-stack architecture, generate and refine React components and Express routes, integrate Prisma with SQLite, and connect the application to OpenRouter and Sarvam.

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

## Demo

### Live Demo

Not deployed yet. Add the deployed project URL here when available.

### Demo / Pitch Video

Add the demo or pitch video URL here.

The recommended demo flow is:

1. Create a contact and add relationship notes.
2. Generate an AI relationship summary.
3. Record or upload a meeting clip and transcribe it with Sarvam.
4. Generate a meeting summary and extract follow-up tasks.
5. Show the updated contact timeline, daily brief, and conversation preparation view.

## Screenshots

Screenshots have not been added yet. Suggested screenshots:

- Dashboard and daily brief
- Contacts directory
- Contact detail and relationship summary
- Sarvam meeting transcription and AI summary
- Tasks and follow-up workflow
- Conversation preparation panel

## How to Run Locally

### Prerequisites

- Node.js and npm
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
npx prisma migrate dev
npm run dev
```

Add your credentials to `server/.env`:

```env
DATABASE_URL="file:./file.db"
PORT=4000

OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini

SARVAM_API_KEY=your_sarvam_key
SARVAM_STT_MODEL=saaras:v3
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
cd server
npm run build

cd ../app
npm run build
```

## Additional Notes

- CRUD features continue to work without API keys, but AI and transcription features require their respective services.
- Sarvam's synchronous transcription endpoint accepts audio clips up to 30 seconds. The recorder stops automatically at 29 seconds, and multiple clips can be appended to one transcript.
- Meeting transcripts can be edited before they are summarized or saved.
- Relationship scores are calculated from current CRM data and are not stored as a fixed database value.
- Deleting a contact also removes its notes, timeline events, and meeting notes. Associated tasks are preserved with the contact reference cleared.
- Future improvements include long-form batch transcription with speaker diarization, calendar and email integrations, cloud deployment, contact import/export, notifications, and native mobile applications.
