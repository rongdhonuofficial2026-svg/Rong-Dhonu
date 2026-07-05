# রংধনু — Rongdhonu Art Exhibition Platform

> A bilingual (English/Bengali) art exhibition management platform for the Rongdhonu artists' collective — built with Next.js 16, Supabase, and deployed on Vercel.

---

## Table of Contents

- [Overview](#overview)
- [Live URLs](#live-urls)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Route Architecture](#route-architecture)
- [Key Features](#key-features)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## Overview

Rongdhonu is a full-stack web platform for a Bengali artists' collective that manages annual art exhibitions. It provides:

- **Public-facing pages** — Exhibition listings, gallery, artist profiles, and catalog downloads.
- **Artist dashboard** — Artwork submission, status tracking, notification inbox, and profile management.
- **Admin/Committee panel** — Exhibition management, artwork moderation, catalog publishing, audit logs, and user management.
- **Bilingual support** — Every piece of user-facing content is stored and rendered in both English (`en`) and Bengali (`bn`).
- **Email notifications** — Transactional emails via Resend, sent through a Supabase Edge Function.

---

## Live URLs

| Environment | URL |
|---|---|
| Production | `https://rongdhonu.vercel.app` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/<project-ref>` |
| Vercel Dashboard | `https://vercel.com/team/rongdhonu` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Backend / DB | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Internationalisation | next-intl (`en`, `bn`) |
| Email | Resend via Supabase Edge Function `send-email` |
| Deployment | Vercel |
| Styling | Tailwind CSS v4 |
| ORM / Query | Supabase JS client (`@supabase/ssr`) |

---

## Project Structure

```
rong dhonu/
├── app/
│   ├── (public)/               # Publicly accessible routes
│   │   ├── page.tsx            # Home page
│   │   ├── exhibitions/        # Exhibition listing & detail
│   │   ├── gallery/            # Media gallery
│   │   ├── artists/            # Artist directory & profiles
│   │   └── catalogs/           # Catalog browser & download
│   ├── (auth)/                 # Authentication flows
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (protected)/            # Authenticated artist routes
│   │   └── dashboard/
│   │       ├── artworks/       # Submission & management
│   │       ├── profile/        # Profile editor
│   │       └── notifications/  # Notification inbox
│   ├── (admin)/                # Admin & committee routes
│   │   └── admin/
│   │       ├── exhibitions/
│   │       ├── artworks/
│   │       ├── catalogs/
│   │       ├── users/
│   │       └── audit-logs/
│   └── api/
│       └── catalogs/
│           └── download/       # Catalog download + counter
├── supabase/
│   ├── functions/
│   │   └── send-email/         # Resend email Edge Function
│   └── migrations/             # SQL migration files
├── messages/
│   ├── en.json                 # English i18n strings
│   └── bn.json                 # Bengali i18n strings
├── middleware.ts               # next-intl locale + auth middleware
├── docs/                       # Extended documentation (this folder)
└── public/
    └── locales/                # Static locale assets
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- `pnpm` >= 9.x (or `npm` >= 10.x)
- Supabase CLI >= 2.x (`npm i -g supabase`)
- A Supabase project (free tier is sufficient for development)
- A Resend account and API key

### 1. Clone the repository

```bash
git clone https://github.com/your-org/rong-dhonu.git
cd "rong dhonu"
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

See [`docs/ENV_GUIDE.md`](./docs/ENV_GUIDE.md) for a detailed description of every variable.

### 4. Set up Supabase locally (optional but recommended)

```bash
supabase start
supabase db push
```

This starts a local Supabase stack (Postgres + Auth + Storage + Edge Runtime) using Docker.

### 5. Run the development server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

> **Turbopack** is enabled by default (`next dev --turbopack`). If you encounter issues, fall back with `pnpm dev:webpack`.

### 6. Seed the database (development only)

```bash
pnpm db:seed
```

This inserts sample exhibitions, artworks, and users for local testing.

---

## Environment Variables

The following variables are required. See [`docs/ENV_GUIDE.md`](./docs/ENV_GUIDE.md) for full details.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=

# Email (Resend)
RESEND_API_KEY=

# next-intl
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## Database Schema

See [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) for full table and RLS policy documentation.

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | Extended user data, roles, notification preferences |
| `exhibitions` | Annual exhibition records with bilingual metadata |
| `artworks` | Artist submissions with approval workflow |
| `catalogs` | PDF catalogs linked to exhibitions |
| `notifications` | In-app notification queue per user |
| `audit_logs` | Immutable admin action log |
| `gallery_media` | Photos/videos grouped by exhibition |
| `committee_members` | Committee membership records |
| `exhibition_participants` | Artist↔Exhibition join table |
| `events` | Exhibition-related event listings |

---

## Route Architecture

### Middleware

`middleware.ts` handles two concerns in sequence:

1. **Locale detection** — via `next-intl`'s `createMiddleware`. Detects from `Accept-Language` header, cookie, or URL prefix (`/en/`, `/bn/`).
2. **Auth guard** — Supabase session validation. Unauthenticated requests to `(protected)` and `(admin)` routes are redirected to `/login`.

### Route Groups

| Group | Path prefix | Auth required | Roles |
|---|---|---|---|
| `(public)` | `/` | No | Any |
| `(auth)` | `/login`, `/register`, `/reset-password` | No | Unauthenticated |
| `(protected)` | `/dashboard/*` | Yes | `member`, `committee`, `admin` |
| `(admin)` | `/admin/*` | Yes | `admin`, `committee` |

---

## Key Features

### Bilingual Content (next-intl)

All database content that is user-facing is stored in `_en` / `_bn` column pairs. The active locale is read from the URL prefix and used to select the correct column at query time.

```typescript
// Example: selecting locale-aware exhibition title
const title = locale === 'bn' ? exhibition.theme_bn : exhibition.theme_en;
```

### Artwork Submission Workflow

1. Artist submits artwork via `/dashboard/artworks/new`.
2. Artwork stored in Supabase Storage, record created with `status: 'pending'`.
3. Admin/committee member reviews at `/admin/artworks`.
4. On approval or rejection, the `send-email` Edge Function is triggered.
5. Artist receives in-app notification + email.

### Catalog Download

`GET /api/catalogs/download?id=<catalog-id>`

- Validates the catalog is `published`.
- Increments `total_downloads` atomically via a Postgres function.
- Returns a signed Supabase Storage URL (valid for 60 seconds).

### Email Notifications

Emails are sent exclusively through the `send-email` Supabase Edge Function using the Resend SDK. This keeps the `RESEND_API_KEY` server-side only.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Development | `pnpm dev` | Next.js dev server with Turbopack |
| Build | `pnpm build` | Production build |
| Start | `pnpm start` | Production server |
| Lint | `pnpm lint` | ESLint |
| Type check | `pnpm typecheck` | `tsc --noEmit` |
| DB push | `pnpm db:push` | Push migrations to Supabase |
| DB seed | `pnpm db:seed` | Insert development seed data |
| DB reset | `pnpm db:reset` | Reset local DB and re-seed |
| Edge deploy | `pnpm functions:deploy` | Deploy all Edge Functions |

---

## Contributing

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes. Run `pnpm lint && pnpm typecheck` before committing.
3. Write or update relevant tests.
4. Open a pull request against `main` and request review.
5. Do **not** commit `.env.local` or any file containing secrets.

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(admin): add bulk artwork rejection with reason
fix(catalog): correct download counter race condition
docs(readme): update environment variable list
```

---

## Documentation

| File | Contents |
|---|---|
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Vercel + Supabase production deployment guide |
| [`docs/ADMIN_MANUAL.md`](./docs/ADMIN_MANUAL.md) | Step-by-step admin panel usage |
| [`docs/ARTIST_GUIDE.md`](./docs/ARTIST_GUIDE.md) | Artist onboarding and dashboard guide |
| [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) | API routes, Edge Functions, DB schema & RLS |
| [`docs/ENV_GUIDE.md`](./docs/ENV_GUIDE.md) | All environment variables explained |
| [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md) | Backups, monitoring, and operational runbooks |

---

## License

Copyright © Rongdhonu Artists' Collective. All rights reserved.
