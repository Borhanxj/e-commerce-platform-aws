# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An e-commerce platform with a React frontend (Vite) and Express.js backend.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`backend/`)
```bash
node server.js    # Start Express server (default port 3000)
```

No test runner is configured yet in either package.

### Docker
```bash
docker compose up --build   # First run, or after package.json changes
docker compose up           # Subsequent runs
docker compose down         # Stop and remove containers
```

Services: frontend → http://localhost:5173, backend → http://localhost:3000, PostgreSQL → localhost:5432

Each service has a `Dockerfile` (production) and `Dockerfile.dev` (development). `docker-compose.yml` uses the dev Dockerfiles with volume mounts for hot reload.

## Database

```bash
docker compose exec db psql -U postgres -d ecommerce   # Open psql shell
docker compose exec db psql -U postgres -d ecommerce -c "\dt"   # List tables
docker compose exec db psql -U postgres -d ecommerce -c "\d users"   # Describe a table
```

## Architecture

**Frontend:** React 19 + Vite. Entry point: `src/main.jsx` → `src/App.jsx`. Styling via CSS custom properties in `src/index.css` (supports light/dark mode). ESLint uses the modern flat config format (`eslint.config.js`).

**Backend:** Express 5 server (`server.js`). PostgreSQL connection via `db.js` (uses `DATABASE_URL`). Auth routes live in `routes/auth.js` — `POST /api/auth/register` and `POST /api/auth/login` — using `bcrypt` for password hashing and `jsonwebtoken` for JWT issuance. `GET /` is a health-check that also verifies DB connectivity.

**No monorepo tooling** — frontend and backend are independent npm workspaces; run `npm install` separately in each directory.

## Environment

Create a `.env` in `backend/` for local config (already gitignored). Required variables:

```
PORT=3000
DATABASE_URL=postgres://postgres:password@localhost:5432/ecommerce
JWT_SECRET=your_secret_here
```

`PORT` defaults to `3000` if not set.
