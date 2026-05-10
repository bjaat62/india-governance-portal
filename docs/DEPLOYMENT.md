# Deployment Guide

## Recommended split

- Frontend: Vercel
- API: Render, Railway, Fly.io, or a Node-capable VPS
- Database: Neon, Supabase Postgres, Render Postgres, Railway Postgres, or AWS RDS
- Object storage for photos: S3, Cloudflare R2, or equivalent

The current implementation stores uploads locally on the API server for simplicity. For true production resilience, replace local uploads with object storage and store public file URLs in the database.

## Frontend deployment

Deploy `apps/web` as a Next.js application.

Required environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

Recommended Vercel settings:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`

## API deployment

Deploy `apps/api` as a Node service.

Required environment variables:

```bash
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
DATABASE_URL=postgresql://...
JWT_SECRET=use-a-long-random-secret
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=replace-this-immediately
```

Recommended API settings:

- Root Directory: `apps/api`
- Install Command: `npm install`
- Build Command: `npm run build`
- Start Command: `npm run start`

## Database setup

1. Provision a PostgreSQL database.
2. Set `DATABASE_URL` for the API service.
3. Run Prisma generate and migrations.
4. Run the seed script if you want starter data.

Example commands:

```bash
npm --workspace @india/api run prisma:generate
npm --workspace @india/api run prisma:migrate -- --name init
npm --workspace @india/api run db:seed
```

If your platform does not support workspace flags in its UI directly, run the equivalent commands inside `apps/api`.

## Production hardening checklist

- Replace starter admin credentials
- Move uploads from local disk to object storage
- Add rate limiting to auth routes
- Add audit logging for admin mutations
- Add request tracing and structured logs
- Add monitoring and alerts
- Connect a verified government or editorial data feed for live records
- Add automated refresh/import jobs for office-holder data
- Add role-based access control if multiple admin roles are required

## Suggested next production upgrades

- Replace local JWT storage with HttpOnly cookie sessions
- Add pagination and server-side sorting to admin lists
- Add WYSIWYG or structured biography editing
- Add import pipelines from CSV or official APIs
- Add image optimization and CDN caching
- Add automated sitemap and structured data expansion
