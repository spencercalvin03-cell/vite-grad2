# GradParty

A web app for high school seniors to discover, schedule, and RSVP to graduation parties.

## Features (MVP)

- **Join school** — Onboarding flow: create a profile and select your school
- **View events** — Browse all parties at your school, filterable and searchable
- **Calendar** — Visual monthly calendar with heat indicators for busy days
- **Create event** — Host a party with title, date, time, description, location, and privacy settings
- **RSVP** — Mark yourself as Going / Maybe / Can't go on any event
- **Event detail** — Full detail view with host info, location reveal, and RSVP counts
- **Profile** — View your hosted events and events you're attending

All state is stored in `localStorage` — no backend required.

---

## File structure

```
gradparty/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── context/
│   │   ├── AppContext.js       # Global state, reducer, localStorage persistence
│   │   └── useToast.js         # Toast notification hook
│   ├── components/
│   │   ├── Navbar.js           # Top navigation bar
│   │   ├── Onboarding.js       # 3-step join school flow
│   │   ├── EventsList.js       # Events list with filters + search
│   │   ├── EventDetail.js      # Single event detail page
│   │   ├── CreateEvent.js      # Create party form
│   │   ├── Calendar.js         # Monthly calendar grid
│   │   ├── Profile.js          # User profile page
│   │   └── EventCard.js        # Reusable event card component
│   ├── App.js                  # Root component + routing
│   ├── index.js                # React entry point
│   └── index.css               # All styles (CSS variables + utility classes)
├── package.json
├── vercel.json
└── README.md
```

---

## Running locally

### Prerequisites

- Node.js 18+ — https://nodejs.org

### Steps

```bash
# 1. Install dependencies (no deprecation warnings)
npm install

# 2. Start the dev server
npm start
```

The app will open at **http://localhost:5173**.

---

## Building for production

```bash
npm run build
```

Output goes to `dist/`.

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B — Vercel Dashboard (recommended)

1. Push to GitHub
2. Import the repo at https://vercel.com
3. Vercel auto-detects Vite — no config needed
4. Click **Deploy**

The `vercel.json` is pre-configured:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## Tech stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | React 18                                |
| Routing    | React Router v6                         |
| State      | useReducer + Context API + localStorage |
| Styling    | Plain CSS (no framework)                |
| Fonts      | Google Fonts (Syne + DM Sans)           |
| Build tool | **Vite** (fast, zero deprecated deps)   |
| Deploy     | Vercel                                  |

---

## Next steps (post-MVP)

- Add a real backend (e.g. Supabase or Firebase) for shared data across users
- School email verification via magic link
- Push notifications for new events
- Friend system and friend activity feed
- Map view of events
