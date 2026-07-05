# Environment Variable Guide — Rongdhonu

This document describes every environment variable used by the Rongdhonu platform, where to find the values, which runtime needs them, and what happens if they are misconfigured.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Variable Groups](#variable-groups)
  - [Supabase](#supabase)
  - [Application](#application)
  - [Email — Resend](#email--resend)
  - [Internationalisation](#internationalisation)
- [Where to Set Variables](#where-to-set-variables)
  - [Local Development](#local-development)
  - [Vercel Production](#vercel-production)
  - [Supabase Edge Functions](#supabase-edge-functions)
- [`.env.example` Template](#envexample-template)
- [Common Mistakes](#common-mistakes)

---

## Quick Reference

| Variable | Required | Exposed to browser | Runtime |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | Next.js + Edge |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Next.js + Edge |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ | Server only |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | Next.js |
| `RESEND_API_KEY` | ✅ | ❌ | Supabase Edge only |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | ✅ | ✅ | Next.js |
| `SUPABASE_JWT_SECRET` | ⚠️ Advanced | ❌ | Server only |

---

## Variable Groups

### Supabase

#### `NEXT_PUBLIC_SUPABASE_URL`

- **Type:** URL string
- **Example:** `https://abcdefghijkl.supabase.co`
- **Where to find:** Supabase Dashboard → Project Settings → API → Project URL
- **Used by:** Supabase JS client on both client and server.
- **Effect if missing:** The Supabase client cannot initialise; the entire application fails to load.

```typescript
// Used in lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

---

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Type:** JWT string
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Project Settings → API → `anon` `public`
- **Used by:** Client-side Supabase queries and Auth flows. Subject to Row Level Security (RLS).
- **Effect if missing:** All database queries and authentication fail.

> **Security note:** This key is safe to expose in the browser because all access is gated by RLS policies. Never bypass RLS with this key — use `SUPABASE_SERVICE_ROLE_KEY` on the server only when intentional.

---

#### `SUPABASE_SERVICE_ROLE_KEY`

- **Type:** JWT string
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Project Settings → API → `service_role` `secret`
- **Used by:** Server-side admin operations (e.g., creating a profile after signup, writing audit logs, generating signed URLs in `/api/catalogs/download`).
- **Effect if missing:** Admin API routes and server actions that require privileged access will throw 401/403 errors.

> ⚠️ **Never expose this key to the browser.** Do not prefix it with `NEXT_PUBLIC_`. If it leaks, rotate it immediately in the Supabase Dashboard.

```typescript
// Used in lib/supabase/server.ts (server components / route handlers only)
import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
```

---

#### `SUPABASE_JWT_SECRET`

- **Type:** String (random, min 32 chars)
- **Where to find:** Supabase Dashboard → Project Settings → API → JWT Secret
- **Used by:** Verifying Supabase JWTs manually (e.g., in custom middleware or webhook validation). Not required for standard `@supabase/ssr` usage.
- **Effect if missing:** Custom JWT verification logic will fail. Standard Supabase client operations are unaffected.

---

### Application

#### `NEXT_PUBLIC_APP_URL`

- **Type:** URL string (no trailing slash)
- **Development value:** `http://localhost:3000`
- **Production value:** `https://rongdhonu.vercel.app` (or your custom domain)
- **Used by:**
  - Constructing absolute URLs in email templates (e.g., password reset link, catalog download link).
  - Open Graph meta tags.
  - Canonical URLs for SEO.
- **Effect if missing:** Email links will be broken or relative; OG images may not work correctly.

```typescript
// Example usage in email template construction
const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
```

---

### Email — Resend

#### `RESEND_API_KEY`

- **Type:** String
- **Example:** `re_aBcDeFgHiJkLmNoPqRsTuVwXyZ`
- **Where to find:** [resend.com](https://resend.com) → API Keys → Create API Key
- **Used by:** **Supabase Edge Function only** (`supabase/functions/send-email/index.ts`). This variable is **not** set in `.env.local` — it is set as a Supabase secret.
- **Effect if missing:** All transactional emails (artwork approval/rejection, password reset, new catalog notification) will silently fail. Check the Edge Function logs in the Supabase Dashboard.

**Setting the secret for the Edge Function:**

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_key
```

**Listing current secrets:**

```bash
supabase secrets list
```

> The key must be tied to a verified domain (e.g., `noreply@mail.rongdhonu.com`) in Resend. Emails sent from an unverified domain will be rejected.

---

### Internationalisation

#### `NEXT_PUBLIC_DEFAULT_LOCALE`

- **Type:** `"en"` or `"bn"`
- **Default:** `en`
- **Used by:** `middleware.ts` to determine the fallback locale when the user's preferred language cannot be detected.
- **Effect if missing:** `next-intl` defaults to the first locale in its config. Set it explicitly to avoid ambiguity.

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'bn'],
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
})
```

---

## Where to Set Variables

### Local Development

Create a `.env.local` file at the project root. This file is git-ignored automatically by Next.js.

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

> Do **not** create a `.env` file for local secrets. `.env` is committed to git by convention in some projects; `.env.local` is always git-ignored by Next.js.

### Vercel Production

1. Open the [Vercel Dashboard](https://vercel.com) and select the **Rongdhonu** project.
2. Navigate to **Settings → Environment Variables**.
3. Add each variable and choose the target environments (**Production**, **Preview**, **Development**).
4. For Preview deployments (pull requests), you may want to point to a separate Supabase staging project.
5. Click **Save** and trigger a new deployment for the changes to take effect.

**Recommended Vercel variable configuration:**

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod project URL | staging project URL | local URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | staging anon key | local anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod service key | staging service key | local service key |
| `NEXT_PUBLIC_APP_URL` | `https://rongdhonu.vercel.app` | Vercel preview URL | `http://localhost:3000` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | `en` | `en` |

### Supabase Edge Functions

Edge Functions run in the Supabase Deno runtime and do **not** have access to Vercel environment variables. Secrets must be set separately using the Supabase CLI.

```bash
# Set a secret
supabase secrets set RESEND_API_KEY=re_your_key

# Set multiple secrets from a file (never commit this file)
supabase secrets set --env-file ./supabase/.env.edge

# View all Edge Function secrets (values are redacted)
supabase secrets list
```

The `supabase/.env.edge` file (git-ignored) should contain:

```env
RESEND_API_KEY=re_your_actual_key
```

---

## `.env.example` Template

This file should be committed to the repository as documentation. It contains no real values.

```env
# =============================================================================
# Rongdhonu — Environment Variables
# Copy this file to .env.local and fill in your values.
# NEVER commit .env.local to version control.
# =============================================================================

# --- Supabase -----------------------------------------------------------------
# Found at: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: only needed for custom JWT verification
# SUPABASE_JWT_SECRET=your-jwt-secret

# --- Application --------------------------------------------------------------
# No trailing slash. Use http://localhost:3000 for local development.
NEXT_PUBLIC_APP_URL=https://rongdhonu.vercel.app

# --- Internationalisation -----------------------------------------------------
NEXT_PUBLIC_DEFAULT_LOCALE=en

# --- Email (Resend) -----------------------------------------------------------
# NOTE: Do NOT set RESEND_API_KEY here for production.
# Set it as a Supabase secret: `supabase secrets set RESEND_API_KEY=...`
# It is only included here for local Edge Function testing via `supabase start`.
RESEND_API_KEY=re_your_resend_api_key
```

---

## Common Mistakes

### ❌ Using `SUPABASE_SERVICE_ROLE_KEY` in a client component

The service role key bypasses all RLS. If used in a client component, it is exposed in the browser bundle.

```typescript
// WRONG — service role key in a client component
'use client'
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
```

```typescript
// CORRECT — service role key in a Route Handler or Server Component only
// app/api/catalogs/download/route.ts
import { createAdminClient } from '@/lib/supabase/server'
```

---

### ❌ Missing `NEXT_PUBLIC_` prefix on client-side variables

Variables without the `NEXT_PUBLIC_` prefix are `undefined` in the browser.

```typescript
// WRONG — will be undefined in the browser
process.env.SUPABASE_URL

// CORRECT
process.env.NEXT_PUBLIC_SUPABASE_URL
```

---

### ❌ Forgetting to redeploy after adding Vercel variables

Environment variables added to Vercel only take effect on the **next deployment**. After saving a new variable, trigger a manual redeploy from the Vercel Dashboard or push a commit.

---

### ❌ Setting `RESEND_API_KEY` as a Vercel variable instead of a Supabase secret

The `send-email` Edge Function runs in Supabase's Deno runtime, not in Vercel's Node.js runtime. Vercel environment variables are invisible to Supabase Edge Functions.

```bash
# Correct way to set the Resend key for Edge Functions
supabase secrets set RESEND_API_KEY=re_your_key
```
