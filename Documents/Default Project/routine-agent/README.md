# RoutineOS — Personal Routine Planning Agent

> An intelligent personal operating system that understands your life and continuously plans your day.

## Live Demo Flow

Follow these steps in order (all clickable, no setup needed):

### Step 1 — Load Demo Data
Open the app. Sample commitments, goals, and tasks load automatically.

### Step 2 — Generate Your Week
Click **"Generate My Week"** and watch the agent:
- **Understanding** → analyzing your commitments
- **Planning** → balancing goals and available time
- **Optimizing** → resolving conflicts
- **Ready** → weekly routine appears

### Step 3 — See Your Weekly Routine
A full 7-day timeline with color-coded blocks:
- 🔵 Fixed commitments (College, Gym, Internship)
- 🔷 Goals (React, DSA, Hackathon)
- 🟢 Recurring tasks (DSA Practice, Walk, Revision)
- 🟣 Sleep

### Step 4 — Change a Commitment
Click **"Change Commitment"** in the header:
1. Select **Gym**
2. Change time from `18:30–19:30` → `19:30–20:30`
3. Click **"Save & Detect Conflicts"**

### Step 5 — See Conflicts Detected
The agent shows:
- ⚠️ Conflict count and descriptions
- **BEFORE** panel — original times
- **AFTER** panel — proposed new times
- List of moved/added/removed blocks

### Step 6 — Approve or Reject
- **[Approve Changes]** → routine updates live, green "Routine updated successfully" banner
- **[Reject]** → original routine restored, gray "Changes rejected" banner

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| State | Zustand |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Planning Engine | Deterministic constraint solver (TypeScript) |

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
cd frontend
npm run build
```

## Google Calendar Setup (optional)

The Calendar page connects to your **real** Google Calendar using read-only OAuth. If credentials are
not configured, the page shows **"Google Calendar setup required"** and never fakes a connection.

### 1. Create a Google Cloud project
Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project.

### 2. Enable the Google Calendar API
APIs & Services → Library → search **Google Calendar API** → Enable.

### 3. Configure the OAuth consent screen
APIs & Services → OAuth consent screen → **External** → fill in app name/email →
under **Test users**, add your Google account email.

### 4. Create a Web application OAuth client
APIs & Services → Credentials → Create credentials → **OAuth client ID** →
Application type: **Web application**.

### 5. Add authorized JavaScript origins
```
http://localhost:5173          # development
https://<your-site>.netlify.app  # deployed Netlify origin
```

### 6. Set environment variables
```bash
cp frontend/.env.example frontend/.env
# edit frontend/.env and paste your real values
```

```
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
VITE_GOOGLE_API_KEY=...
```

### 7. Rebuild
```bash
cd frontend && npm run build
```

> Only frontend-safe values (Client ID + API Key) are used. No client secret ever ships to the browser.
> `.env` is gitignored — never commit real credentials.

### What sync does
- Imports upcoming events from the **primary** calendar (read-only, `calendar.readonly` scope)
- Converts each event into a **fixed commitment** the planner routes around
- Detects conflicts between imported events and your generated routine
- Lets you re-sync or disconnect at any time

## Project Structure

```
routine-agent/
├── frontend/
│   ├── src/
│   │   ├── components/ui/       # Reusable UI components
│   │   ├── components/layout/   # App shell, page layout
│   │   ├── pages/               # Dashboard, Goals, Calendar, Settings
│   │   ├── lib/
│   │   │   ├── planner.ts       # Scheduling engine
│   │   │   ├── store.ts         # Global state (Zustand)
│   │   │   └── demoData.ts      # Demo commitments/goals/tasks
│   │   ├── types/               # TypeScript types
│   │   └── styles/              # Global CSS + design tokens
│   └── tailwind.config.js       # Design system
├── src/
│   ├── core/types.ts            # Backend type definitions
│   └── calendar/provider.ts     # Calendar integration adapters
└── config/default.json          # App configuration
```

## Key Features

- **Deterministic planning engine** — respects fixed commitments, working hours, sleep, priorities
- **Conflict detection** — identifies overlaps when commitments change
- **Controlled replanning** — proposes changes, user approves/rejects
- **Agent state visualization** — animated orb shows Understanding → Planning → Optimizing → Ready
- **Weekly timeline** — visual calendar grid with color-coded activity blocks
