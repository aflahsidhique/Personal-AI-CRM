# AI Personal CRM MVP --- Claude Code Build Prompt

## Product

**AI Personal CRM**

**Tagline:** *Never forget a person, conversation, or follow-up again.*

## Goal

Build a polished MVP in **under 1 hour** that is impressive enough for
an investor pitch. Prioritize user experience, storytelling, and AI
workflows over production-ready integrations. Mock AI outputs where
necessary.

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Router
-   React Query
-   Framer Motion
-   Lucide Icons

## Backend

-   Node.js
-   Express
-   MongoDB (or local JSON for speed)

## AI

-   OpenRouter API
-   Mock fallback responses

## Authentication

-   Skip authentication for MVP
-   Use a hardcoded demo user

------------------------------------------------------------------------

# Suggested Folder Structure

``` text
ai-personal-crm/
├── client/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── layouts/
│       ├── lib/
│       ├── types/
│       ├── data/
│       ├── ai/
│       └── assets/
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── prompts/
│   └── utils/
└── README.md
```

------------------------------------------------------------------------

# 60-Minute Build Plan

  Time         Task
  ------------ -------------------------------------------------
  0--10 min    Project setup, routing, layout, sidebar
  10--20 min   Mock data and reusable components
  20--35 min   Dashboard + Contacts + Contact Details
  35--45 min   Tasks + AI Chat + Meeting Notes
  45--55 min   AI utilities + Relationship Score + Daily Brief
  55--60 min   Animations, polish, responsive fixes

------------------------------------------------------------------------

# Pages

## Dashboard

Display: - Today's Tasks - Total Contacts - Follow-ups Due - Birthdays -
Meetings Today - AI Suggestions - Daily Brief - Relationship Score

------------------------------------------------------------------------

## Contacts

Each contact should contain:

-   Photo
-   Name
-   Phone
-   Email
-   Company
-   Position
-   Tags
-   Birthday
-   Social Links
-   Notes
-   AI Relationship Summary

------------------------------------------------------------------------

## Contact Details

Sections: - Profile Header - AI Memory - Timeline - Notes - AI
Suggestions - Relationship Score

------------------------------------------------------------------------

## Meeting Notes

Flow:

``` text
Voice Recording
      ↓
Speech-to-Text
      ↓
AI Summary
      ↓
Action Items
      ↓
Saved Automatically
```

Buttons: - Summarize - Extract Tasks - Save

------------------------------------------------------------------------

## Tasks

Kanban Columns: - Today - Upcoming - Done

------------------------------------------------------------------------

## AI Assistant

Prompt Examples: - Show everyone interested in AI - Clients from Dubai -
People I met last month - Who should I follow up with? - Cold contacts

------------------------------------------------------------------------

## Settings

-   Theme
-   Export Contacts
-   Import CSV
-   Notification Toggle
-   OpenRouter API Key

------------------------------------------------------------------------

# AI Features

Implement mock or API-backed functions:

-   summarizeMeeting()
-   extractTasks()
-   relationshipSummary()
-   followUpSuggestion()
-   dailyBrief()
-   conversationPrep()

Example response:

``` json
{
  "summary": "...",
  "tasks": [],
  "followup": "...",
  "reminder": "..."
}
```

------------------------------------------------------------------------

# Smart Search

Support queries like: - People interested in AI - Investors -
Recruiters - Clients from Dubai - Cold contacts

------------------------------------------------------------------------

# Relationship Score

Suggested weights: - 40% Last Interaction - 30% Meeting Frequency - 20%
Completed Tasks - 10% Notes Count

Display: - Percentage - Progress Circle - Strong / Medium / Weak
Relationship

------------------------------------------------------------------------

# Daily Brief

Example:

> Good Morning 👋

Today's priorities: - Follow up with Rahul - Wish John Happy Birthday -
Meeting with Sarah at 3 PM - Contact 6 cold leads

------------------------------------------------------------------------

# Conversation Prep

Display: - Last Meeting Summary - Budget - Personal Details - Suggested
Opening - Suggested Questions

------------------------------------------------------------------------

# Timeline

Include: - Calls - Meetings - Emails - WhatsApp - Notes - Voice Notes -
Reminders

------------------------------------------------------------------------

# Components

-   DashboardCard
-   ContactCard
-   TimelineItem
-   TaskCard
-   ReminderCard
-   AISuggestionCard
-   RelationshipScore
-   SummaryCard
-   SearchBar
-   Sidebar
-   Header
-   Avatar
-   TagBadge

------------------------------------------------------------------------

# Design

Use a premium SaaS aesthetic: - Rounded cards - Purple/Blue gradients -
Glassmorphism - Framer Motion animations - Dark mode - Responsive layout

------------------------------------------------------------------------

# Demo Data

Generate: - 20 Contacts - 10 Meetings - 40 Tasks - 50 Timeline Events -
15 Birthdays - 25 AI Summaries

------------------------------------------------------------------------

# Pitch Flow

1.  Dashboard
2.  Contact Details
3.  AI Memory
4.  Timeline
5.  Meeting Summary
6.  AI Search
7.  Conversation Prep
8.  Future Vision

------------------------------------------------------------------------

# Success Criteria

The MVP should clearly demonstrate:

-   AI remembers every relationship.
-   AI recommends follow-ups.
-   AI summarizes meetings.
-   AI prepares conversations.
-   The product feels polished and investor-ready.
