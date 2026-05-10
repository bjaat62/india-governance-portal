# India Governance Portal

India Governance Portal is a modern full-stack reference platform for India's constitutional, political, judicial, defence, legislative, and administrative offices.

It ships as a monorepo with:

- `apps/web`: Next.js + Tailwind CSS frontend
- `apps/api`: Node.js + Express API
- `PostgreSQL`: relational data store via Prisma ORM

## Highlights

- Modern responsive homepage with hero, search, governance dashboard, quick navigation, and interactive India map
- Public directory with filters for state, position, party, ministry, and category
- State-wise pages for executive, legislative, and administrative sections
- Person profile pages with biography, education, party, tenure, links, and appointment history
- Admin dashboard for CRUD on people, states, ministries, and photo uploads
- Timeline support for former Prime Ministers and Presidents
- Multi-language-ready UI foundation with English and Hindi toggles
- Dark mode support
- API-first architecture for future integrations and live data sync

## Important note on the seed dataset

The included seed data is a starter dataset intended to demonstrate the schema, API, and UI flows. It combines representative public-office records with illustrative sample entries for legislative coverage. Before a real production rollout, connect the portal to authoritative government data sources and verify current office holders.

## Folder structure

```text
india-governance-portal/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── public/
├── docs/
├── docker-compose.yml
└── package.json
```

## Core data model

Main relational entities:

- `people`
- `positions`
- `states`
- `ministries`
- `appointments`

Supporting entities:

- `politicalParties`
- `adminUsers`

Appointments act as the historical bridge between a person and a role, which makes timelines, former office holders, and state-wise grouping straightforward.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Create environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 4. Generate Prisma client and migrate the database

```bash
npm run prisma:generate
npm --workspace @india/api run prisma:migrate -- --name init
```

### 5. Seed sample data

```bash
npm run db:seed
```

### 6. Run the apps

In separate terminals:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Frontend:

- `http://localhost:3000`

Backend:

- `http://localhost:4000/api`

## Default admin credentials

- Email: `admin@indiagov.in`
- Password: `Admin@123`

Change these in `apps/api/.env` before any real deployment.

## Key API routes

Public:

- `GET /api/dashboard`
- `GET /api/meta`
- `GET /api/people`
- `GET /api/people/:slug`
- `GET /api/states`
- `GET /api/states/:slug`
- `GET /api/positions`
- `GET /api/news`
- `GET /api/timelines`

Admin:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/admin/upload`
- `GET|POST|PUT|DELETE /api/admin/people`
- `GET|POST|PUT|DELETE /api/admin/states`
- `GET|POST|PUT|DELETE /api/admin/ministries`

## UI direction

The frontend uses:

- App Router in Next.js
- Tailwind CSS with custom saffron, navy, and emerald theming
- Sticky glass-style navigation
- Animated cards and layered gradient surfaces
- Responsive grids and split-layout dashboards

## Deployment

Deployment guidance is documented in [docs/DEPLOYMENT.md](/Users/birender/Documents/india/docs/DEPLOYMENT.md).
