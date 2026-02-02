# SkillBarter Platform - Developer Setup

## ?? Project Overview

Monorepo for the SkillBarter application. A backend driven with Node.js/Express/Prisma and a React/Vite frontend targeting service trueques.

## ?? Project Structure

- `/backend/`: Node/Express API, Prisma schema, listeners, and services.
- `/frontend/`: Vite + React client consuming the backend APIs.
- `/docs/`: Requirements, API contract, and supporting artifacts.

## ???? Prerequisites

1. Node.js (LTS)
2. PostgreSQL (matches `DATABASE_URL` / `DIRECT_URL` in `backend/.env`)
3. Git
4. VS Code (recommended) with formatting extensions if desired

## ?? Quickstart (Full-stack)

### 1. Clone & bootstrap

```bash
git clone https://github.com/YOUR-ORG/skill-barter-platform.git
cd skill-barter-platform
```

### 2. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` (or edit `backend/.env`) and ensure `DATABASE_URL` / `DIRECT_URL` point to a running Postgres instance with database `skillbarter_db`.

Generate/align the schema:

```bash
npx prisma migrate dev
npx prisma generate
```

Run the server (auto-reloads on file changes):

```bash
npm run dev
```

The API listens on `http://localhost:3001/api/v1` and exposes routes such as `/users`, `/trades`, `/ratings`, `/notifications`.

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies requests to the backend via `frontend/src/api/client.ts`.

### 4. Daily flow

- Start backend + frontend in separate terminals.
- Visit `http://localhost:5173` to use the app.
- Complete trades from the **Trades** page to trigger rating modal (1-5 stars + tags).
- The public profile and service cards show live reputation (average & count).

## ?? Database Notes

- The schema lives in `backend/prisma/schema.prisma`.
- Migrations are generated into `backend/prisma/migrations/`.
- After any schema change, rerun `npx prisma migrate dev` (or `npx prisma migrate reset` if you can drop data).

## ?? Development Notes

- Backend uses an event emitter pattern for notifications (`backend/src/core/events.js`).
- Ratings are stored in the `ratings` table; each record stores tags, comments, and links to a completed trade.
- The frontend exposes `frontend/src/components/ratings/RatingModal.tsx` for the new modal + tags UI.

## ? Recommended Commands

| Area     | Command                   | Purpose |
|----------|---------------------------|---------|
| Backend  | `npm run dev`              | Start Express API with nodemon |
| Backend  | `npx prisma migrate dev`   | Apply schema changes locally |
| Backend  | `npx prisma generate`      | Refresh generated client |
| Frontend | `npm run dev`              | Launch Vite dev server |

## ?? Roles & Responsibilities

- **Backend Lead**: Owns `backend/`, Prisma schema, and API quality.
- **Frontend Dev**: Builds UI/UX, consumes the API, keeps the client in sync with the contract.

## ?? Contract

Reference `docs/api-contract.md` before adding or consuming endpoints. If it is not part of the contract, coordinate before implementation.
