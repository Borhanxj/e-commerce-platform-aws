# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An e-commerce platform with a React frontend (Vite) and Express.js backend.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev           # Start Vite dev server with HMR
npm run build         # Production build
npm run lint          # ESLint
npm run preview       # Preview production build
npm run format        # Prettier auto-fix
npm run format:check  # Prettier validation (used in CI)
```

### Backend (`backend/`)
```bash
node server.js        # Start Express server (default port 3000)
npm run lint          # ESLint
npm run format        # Prettier auto-fix
npm run format:check  # Prettier validation (used in CI)
npm test              # Jest
```

### Frontend (`frontend/`)
```bash
npm test              # Vitest
```

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
docker compose exec db psql -U postgres -d ecommerce -c "\d auth.users"   # Describe a table
```

### Querying the database

```bash
# List all registered users (id, email, role, created_at — password_hash excluded)
docker compose exec db psql -U postgres -d ecommerce -c "SELECT id, email, role, created_at FROM auth.users;"

# Count users
docker compose exec db psql -U postgres -d ecommerce -c "SELECT COUNT(*) FROM auth.users;"

# Find a specific user by email
docker compose exec db psql -U postgres -d ecommerce -c "SELECT id, email, role, created_at FROM auth.users WHERE email = 'user@example.com';"

# Delete a user by email (useful for re-testing registration)
docker compose exec db psql -U postgres -d ecommerce -c "DELETE FROM auth.users WHERE email = 'user@example.com';"
```

### Running migrations

Migrations are managed with `node-pg-migrate`. Migration scripts live in `backend/migrations/scripts/`.

```bash
docker compose exec backend npm run migrate:up    # Apply all pending migrations
docker compose exec backend npm run migrate:down  # Roll back the last migration
```

To add a new migration, create `backend/migrations/scripts/<N>_description.js` (increment N) with `exports.up` and `exports.down` functions, then run `migrate:up`.

The runner tracks applied migrations in a `pgmigrations` table in the database. Never edit a migration file that has already been applied — write a new one instead.

## Architecture

**Frontend:** React 19 + Vite. Entry point: `src/main.jsx` → `src/App.jsx`. Styling via CSS custom properties in `src/index.css` (supports light/dark mode). ESLint uses the modern flat config format (`eslint.config.js`).

**Backend:** Express 5 server (`server.js`). PostgreSQL connection via `db.js` (uses `DATABASE_URL`). Auth routes live in `routes/auth.js` — `POST /api/auth/register` and `POST /api/auth/login` — using `bcrypt` for password hashing and `jsonwebtoken` for JWT issuance. `GET /` is a health-check that also verifies DB connectivity. ESLint uses the modern flat config format (`eslint.config.mjs`). Prettier config in `.prettierrc`.

**Root setup:** A root-level `package.json` manages Husky git hooks and lint-staged. Run `npm install` at the project root to install these, and separately in `frontend/` and `backend/`.

**Git hooks:** A pre-commit hook (via Husky + lint-staged) runs ESLint and Prettier checks on staged files in both `frontend/` and `backend/` before each commit.

**CI/CD:** GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs ESLint and Prettier checks for both frontend and backend on every push and pull request.

## Environment

Create a `.env` in `backend/` for local config (already gitignored). Required variables:

```
PORT=3000
DATABASE_URL=postgres://postgres:password@localhost:5432/ecommerce
JWT_SECRET=your_secret_here
```

`PORT` defaults to `3000` if not set.
