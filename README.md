# DHH

A web app for the Desi Hip Hop (DHH) scene — browse artists, tracks, and events, follow your favorite artists, and ask questions through an AI assistant ("Ask DHH") that answers using real site data.

## Features

- **Artists** — browse artist profiles with bios and cover images
- **Music** — track listings linked to their artists
- **Events** — upcoming event lineups with venue, date, and artist details
- **Auth** — signup/login with hashed passwords and JWT sessions (cookie-based)
- **Follows** — logged-in users can follow/unfollow artists
- **Ask DHH** — an AI chat assistant that uses tool-calling (Groq) and semantic search (Jina embeddings) over artist/track/event data to answer questions, with zero hallucinated JSON — the model always replies in plain language and the server assembles any result cards

## Tech Stack

- **Frontend**: React 19, React Router, Vite
- **Backend API**: Express 5, PostgreSQL (`pg`), JWT auth, bcrypt
- **AI endpoint**: Vercel serverless function (`api/ask.js`) using Groq (`openai/gpt-oss-120b`) for chat/tool-calling and Jina AI for embeddings
- **Deployment**: Frontend + `/api` on Vercel, backend also deployable to Railway

## Project Structure

```
├── src/                  # React frontend
│   ├── components/       # UI components (ArtistCard, EventCard, AskDHH, AuthModal, ...)
│   ├── pages/            # Route pages (Home, Artists, Music, Events, Profile, ...)
│   ├── context/          # AuthContext, FollowContext
│   └── utils/            # Validation helpers
├── backend/              # Express API (artists, tracks, events, auth, follows)
│   ├── server.js
│   └── db.json / schema
├── api/
│   └── ask.js            # Vercel serverless function powering "Ask DHH"
├── db/
│   ├── schema.sql        # Postgres schema
│   └── seed.sql          # Seed data
├── scripts/
│   ├── seedDhh.mjs            # Seed DHH artist/track/event data
│   ├── generateEmbeddings.js  # Generate embeddings for semantic search
│   └── seedRandom.mjs         # Seed random/demo data
├── server/
│   └── proxy.js          # Local dev proxy
└── data/
    └── embeddings.json   # Precomputed embeddings used by api/ask.js
```

## Getting Started

### Prerequisites

- Node.js >= 20
- A PostgreSQL database

### Installation

```bash
npm install
cd backend && npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:3001
GROQ_API_KEY=your_groq_api_key
JINA_API_KEY=your_jina_api_key
DATABASE_URL=postgres://user:password@host:port/dbname
```

`backend/.env` needs `DATABASE_URL` as well for the Express API to connect to Postgres.

### Database Setup

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

Or seed DHH data via script:

```bash
node scripts/seedDhh.mjs
```

Generate embeddings for the Ask DHH semantic search (writes `data/embeddings.json`):

```bash
node scripts/generateEmbeddings.js
```

### Running Locally

Run the backend API:

```bash
cd backend && npm run dev
```

Run the frontend:

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:3002` — adjust `vite.config.js` or run the proxy in `server/proxy.js` if needed.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run server` | Run a `json-server` mock API from `db.json` |
| `npm run proxy` | Run the local API proxy (`server/proxy.js`) |

In `backend/`:

| Command | Description |
|---|---|
| `npm start` | Start the Express API |
| `npm run dev` | Start the Express API with nodemon (auto-reload) |

## API Overview (backend/server.js)

| Endpoint | Method | Description |
|---|---|---|
| `/artists` | GET | List artists, or fetch one by `?slug=` |
| `/tracks` | GET | List tracks with artist info, or fetch one by `?slug=` |
| `/events` | GET | List events with lineup, or fetch one by `?slug=` |
| `/auth/signup` | POST | Create a user account |
| `/auth/login` | POST | Log in, sets an auth cookie |
| `/auth/logout` | POST | Clear the auth cookie |
| `/auth/me` | GET | Get the current authenticated user |
| `/follows` | GET | Get artists the current user follows |
| `/follows/:artistId` | POST | Follow an artist |
| `/follows/:artistId` | DELETE | Unfollow an artist |

`api/ask.js` (deployed as a Vercel serverless function) exposes a single `POST` endpoint that powers the Ask DHH chat assistant.

## Deployment

- **Frontend + Ask DHH API**: Deployed to Vercel (`vercel.json` rewrites all routes to `index.html` for client-side routing; `api/ask.js` is auto-deployed as a serverless function)
- **Backend**: Deployable to Railway (`railway.json`, `Procfile`) or any Node host
