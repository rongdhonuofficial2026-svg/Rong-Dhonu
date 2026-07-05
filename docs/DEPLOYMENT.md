# Deployment Guide — Rongdhonu

This guide covers the complete production deployment of the Rongdhonu platform: Supabase project setup, Vercel deployment, custom domain configuration, Edge Function deployment, and post-deployment verification.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1 — Supabase Project Setup](#step-1--supabase-project-setup)
- [Step 2 — Database Migrations](#step-2--database-migrations)
- [Step 3 — Storage Buckets & Policies](#step-3--storage-buckets--policies)
- [Step 4 — Supabase Auth Configuration](#step-4--supabase-auth-configuration)
- [Step 5 — Deploy the Edge Function](#step-5--deploy-the-edge-function)
- [Step 6 — Vercel Deployment](#step-6--vercel-deployment)
- [Step 7 — Custom Domain](#step-7--custom-domain)
- [Step 8 — Post-Deployment Verification](#step-8--post-deployment-verification)
- [CI/CD via GitHub Actions](#cicd-via-github-actions)
- [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

Before beginning, ensure you have:

- A [Supabase](https://supabase.com) account with a new project created (choose the **Singapore** region for lowest latency from Bangladesh).
- A [Vercel](https://vercel.com) account connected to your GitHub organisation.
- A [Resend](https://resend.com) account with a **verified sending domain** (e.g., `mail.rongdhonu.com`).
- Supabase CLI installed and authenticated:
  ```bash
  npm install -g supabase
  supabase login
  ```
- Vercel CLI installed (optional, for manual deployments):
  ```bash
  npm install -g vercel
  vercel login
  ```

---

## Step 1 — Supabase Project Setup

### 1.1 Create the Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New project**.
2. Name it `rongdhonu-production`.
3. Choose a strong database password. **Save this password** — it is needed for direct Postgres connections (e.g., migrations from CI).
4. Select region: **Southeast Asia (Singapore)**.
5. Wait for the project to provision (~2 minutes).

### 1.2 Retrieve API Keys

Navigate to **Project Settings → API** and copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

Store these securely (e.g., in a password manager). Never commit them to version control.

### 1.3 Link the CLI to Your Project

```bash
# In the project root
supabase link --project-ref your-project-ref
```

Find the project ref in the Supabase Dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`.

---

## Step 2 — Database Migrations

### 2.1 Push All Migrations

```bash
supabase db push
```

This applies all SQL files in `supabase/migrations/` in chronological order. The migrations create all tables, triggers, functions, indexes, and RLS policies.

### 2.2 Verify the Schema

In the Supabase Dashboard, navigate to **Table Editor** and confirm these tables exist:

- `profiles`, `exhibitions`, `artworks`, `catalogs`
- `notifications`, `audit_logs`, `gallery_media`
- `committee_members`, `exhibition_participants`, `events`

### 2.3 Create the First Admin User

After the first deployment, create the initial admin account:

1. Navigate to **Authentication → Users** in the Supabase Dashboard.
2. Click **Invite user** and enter the admin email address.
3. After the user accepts the invitation and sets a password, update their role in the SQL editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@rongdhonu.com';
```

---

## Step 3 — Storage Buckets & Policies

### 3.1 Create Buckets

In the Supabase Dashboard, navigate to **Storage** and create the following buckets:

| Bucket Name | Public | File size limit |
|---|---|---|
| `avatars` | ✅ Yes | 2 MB |
| `artworks` | ✅ Yes | 10 MB |
| `catalogs` | ❌ No | 50 MB |
| `exhibitions` | ✅ Yes | 20 MB |
| `covers` | ✅ Yes | 5 MB |

### 3.2 Apply Storage Policies

Run the following SQL in the Supabase SQL Editor to configure storage access policies:

```sql
-- avatars: users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- artworks: authenticated members can upload, public can view
CREATE POLICY "Members can upload artworks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artworks');

CREATE POLICY "Artworks are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artworks');

-- catalogs: private — only service role can read/write
CREATE POLICY "Service role manages catalogs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'catalogs');

-- exhibitions: admin/committee can manage, public can read
CREATE POLICY "Public can view exhibition media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('exhibitions', 'covers'));

CREATE POLICY "Admin can manage exhibition media"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id IN ('exhibitions', 'covers')
  AND public.is_admin_or_committee()
);
```

---

## Step 4 — Supabase Auth Configuration

### 4.1 Email Templates

In the Supabase Dashboard, navigate to **Authentication → Email Templates**.

Customise the following templates to use Rongdhonu branding:

**Confirm signup:**
- Subject: `Welcome to Rongdhonu — Please confirm your email`
- Body: Include the `{{ .ConfirmationURL }}` variable. Mention the platform name and encourage profile completion.

**Reset password:**
- Subject: `রংধনু — Reset your password`
- Body: Include `{{ .ConfirmationURL }}`. Add both English and Bengali instructions.

### 4.2 Auth Settings

Navigate to **Authentication → URL Configuration**:

- **Site URL:** `https://rongdhonu.vercel.app`
- **Redirect URLs:** Add:
  - `https://rongdhonu.vercel.app/**`
  - `http://localhost:3000/**` (for local development)

Navigate to **Authentication → Providers**:
- Ensure **Email** provider is enabled.
- Disable any OAuth providers not in use (e.g., Google, GitHub) to reduce attack surface unless configured.

### 4.3 JWT Expiry

Navigate to **Project Settings → Auth**:
- Set **JWT expiry** to `3600` seconds (1 hour) for production.
- Enable **Refresh token rotation**.

---

## Step 5 — Deploy the Edge Function

### 5.1 Set the Resend Secret

```bash
supabase secrets set RESEND_API_KEY=re_your_resend_api_key
```

Verify it was set (values are redacted):

```bash
supabase secrets list
```

### 5.2 Deploy the Function

```bash
supabase functions deploy send-email --no-verify-jwt
```

> `--no-verify-jwt` is used because the function validates the service role token manually in the function body, giving finer-grained control over error responses.

### 5.3 Test the Function

```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Rongdhonu Test Email",
    "template": "welcome",
    "data": {
      "name": "Test User",
      "loginUrl": "https://rongdhonu.vercel.app/login"
    }
  }'
```

Expected response: `{"id":"resend-message-id"}` and the email appears in your Resend dashboard.

---

## Step 6 — Vercel Deployment

### 6.1 Import the Repository

1. Open [vercel.com/new](https://vercel.com/new).
2. Click **Import Git Repository** and select the `rong-dhonu` repository.
3. Select the team or personal account to deploy under.
4. Vercel will auto-detect Next.js. Leave the framework preset as **Next.js**.

### 6.2 Configure Build Settings

| Setting | Value |
|---|---|
| Build Command | `pnpm build` |
| Output Directory | `.next` (auto-detected) |
| Install Command | `pnpm install --frozen-lockfile` |
| Node.js version | `20.x` |

### 6.3 Add Environment Variables

In the Vercel project settings, navigate to **Settings → Environment Variables** and add:

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://rongdhonu.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://rongdhonu-staging.vercel.app` | Preview |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | All |

### 6.4 Deploy

Click **Deploy**. Vercel will run `pnpm install && pnpm build` and deploy the `.next` output. The first deployment typically takes 3–5 minutes.

After a successful deployment, your app is live at the Vercel-generated URL (e.g., `https://rongdhonu.vercel.app`).

### 6.5 Verify the Deployment

Check the following pages load correctly:

- `https://rongdhonu.vercel.app/` — Home page (bilingual)
- `https://rongdhonu.vercel.app/exhibitions` — Exhibition list
- `https://rongdhonu.vercel.app/login` — Login page
- `https://rongdhonu.vercel.app/bn/` — Bengali locale home page

---

## Step 7 — Custom Domain

### 7.1 Add Domain in Vercel

1. In the Vercel project, navigate to **Settings → Domains**.
2. Enter `rongdhonu.com` and click **Add**.
3. Vercel will show you the DNS records to add.

### 7.2 Configure DNS

In your domain registrar (e.g., Namecheap, GoDaddy), add the following DNS records:

| Type | Host | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

DNS propagation can take up to 48 hours, but typically completes within 30 minutes.

### 7.3 Update `NEXT_PUBLIC_APP_URL`

After the custom domain is live, update the environment variable in Vercel:

```
NEXT_PUBLIC_APP_URL=https://rongdhonu.com
```

Trigger a new deployment for the change to take effect.

### 7.4 Update Supabase Auth Redirect URLs

Add the custom domain to Supabase's allowed redirect URLs:

- `https://rongdhonu.com/**`
- `https://www.rongdhonu.com/**`

---

## Step 8 — Post-Deployment Verification

Run through the following checklist after each production deployment:

### Functional Checks

- [ ] Home page loads in English (`/`) and Bengali (`/bn/`)
- [ ] Exhibition list page (`/exhibitions`) shows data from the database
- [ ] Gallery page (`/gallery`) displays images
- [ ] Artist directory (`/artists`) lists approved artists
- [ ] Catalog list (`/catalogs`) shows published catalogs
- [ ] Catalog download (`/api/catalogs/download?id=<id>`) returns a signed URL and increments the counter
- [ ] Login and registration flows work end-to-end
- [ ] Password reset email is delivered (check Resend dashboard)
- [ ] Artist dashboard (`/dashboard`) is accessible after login
- [ ] Admin panel (`/admin`) rejects unauthenticated requests

### Performance Checks

- Run [PageSpeed Insights](https://pagespeed.web.dev/) on the home page. Target: LCP < 2.5s.
- Check Vercel Analytics for error rates immediately after deployment.

### Security Checks

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **not** present in the browser bundle (check DevTools → Network → page HTML/JS).
- [ ] Navigating to `/admin` without login redirects to `/login`.
- [ ] A `member` role user cannot access `/admin` routes.
- [ ] Attempting `DELETE /api/catalogs/download` returns 405.

---

## CI/CD via GitHub Actions

The following workflow automates deployment on every push to `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          NEXT_PUBLIC_DEFAULT_LOCALE: en

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

Required GitHub repository secrets:

- `VERCEL_TOKEN` — Vercel personal access token
- `VERCEL_ORG_ID` — Found in Vercel team settings
- `VERCEL_PROJECT_ID` — Found in Vercel project settings
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`

---

## Rollback Procedure

### Vercel Rollback

To instantly roll back to the previous production deployment:

1. In the Vercel Dashboard, navigate to **Deployments**.
2. Find the last known good deployment.
3. Click the **⋮** menu → **Promote to Production**.

The rollback is instant (no rebuild required).

### Database Rollback

If a migration introduced a breaking schema change:

```bash
# Check migration status
supabase migration list

# Roll back the last migration (if it has a down migration)
supabase db reset
supabase db push --target-migration <previous-migration-timestamp>
```

> **Warning:** `supabase db reset` will drop and recreate the local database. For production, only run targeted rollback SQL manually after reviewing the migration file.

### Edge Function Rollback

Supabase does not have built-in Edge Function versioning. To roll back:

```bash
# Restore the previous version from git
git checkout <previous-commit> -- supabase/functions/send-email/

# Redeploy
supabase functions deploy send-email
```
