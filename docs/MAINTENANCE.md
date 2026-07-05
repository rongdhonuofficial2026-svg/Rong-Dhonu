# Maintenance Guide — Rongdhonu

This document covers database backups, monitoring, performance tuning, routine maintenance tasks, and incident response runbooks for the Rongdhonu platform.

---

## Table of Contents

- [Routine Maintenance Schedule](#routine-maintenance-schedule)
- [Database Maintenance](#database-maintenance)
  - [Backups](#backups)
  - [Restoring from Backup](#restoring-from-backup)
  - [Running Migrations](#running-migrations)
  - [Monitoring Table Growth](#monitoring-table-growth)
  - [Cleaning Up Old Notifications](#cleaning-up-old-notifications)
- [Storage Maintenance](#storage-maintenance)
  - [Orphaned Files Cleanup](#orphaned-files-cleanup)
  - [Storage Usage Monitoring](#storage-usage-monitoring)
- [Application Monitoring](#application-monitoring)
  - [Vercel Analytics & Logs](#vercel-analytics--logs)
  - [Supabase Logs](#supabase-logs)
  - [Edge Function Logs](#edge-function-logs)
  - [Setting Up Uptime Monitoring](#setting-up-uptime-monitoring)
- [Performance Tuning](#performance-tuning)
  - [Database Indexes](#database-indexes)
  - [Next.js Caching Strategy](#nextjs-caching-strategy)
  - [Image Optimisation](#image-optimisation)
- [Security Maintenance](#security-maintenance)
  - [Rotating Secrets](#rotating-secrets)
  - [Reviewing Audit Logs](#reviewing-audit-logs)
  - [Dependency Updates](#dependency-updates)
- [Incident Response Runbooks](#incident-response-runbooks)
  - [Site is Down (5xx / Cannot Connect)](#runbook-site-is-down-5xx--cannot-connect)
  - [Emails Not Being Delivered](#runbook-emails-not-being-delivered)
  - [Catalog Downloads Failing](#runbook-catalog-downloads-failing)
  - [Admin Cannot Log In](#runbook-admin-cannot-log-in)
  - [Database is at Capacity](#runbook-database-is-at-capacity)
- [Annual Exhibition Checklist](#annual-exhibition-checklist)

---

## Routine Maintenance Schedule

| Frequency | Task |
|---|---|
| **Daily** | Check Vercel error rates in Analytics dashboard |
| **Weekly** | Review Supabase Edge Function logs for email delivery failures |
| **Weekly** | Check Supabase Storage usage |
| **Monthly** | Run orphaned file cleanup query |
| **Monthly** | Review audit logs for anomalous activity |
| **Monthly** | Check and apply `npm` dependency updates |
| **Quarterly** | Test backup restoration in a staging environment |
| **Before each exhibition** | Run the Annual Exhibition Checklist (see below) |
| **After each exhibition** | Archive old notifications, update exhibition status to `past` |

---

## Database Maintenance

### Backups

Supabase automatically creates **daily backups** on paid plans. On the free tier, Point-in-Time Recovery (PITR) is not available, so manual backups are strongly recommended before any major operation.

#### Verifying Automated Backups

1. In the Supabase Dashboard, navigate to **Database → Backups**.
2. Confirm that the most recent backup timestamp is within the last 24 hours.
3. The backup retention period depends on your plan:
   - **Free**: 7 days
   - **Pro**: 7 days (PITR available)
   - **Team/Enterprise**: 28+ days (PITR available)

> **Recommendation:** Upgrade to the Supabase Pro plan before the annual exhibition to enable Point-in-Time Recovery and longer retention.

#### Manual Backup via `pg_dump`

For critical operations (e.g., before a major migration), create a manual backup:

```bash
# Get the connection string from Supabase Dashboard → Project Settings → Database
pg_dump \
  "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  -F c \
  -f "rongdhonu-backup-$(date +%Y%m%d-%H%M%S).dump"
```

Store the `.dump` file in a secure, off-site location (e.g., encrypted Google Drive or S3 bucket). Do **not** commit it to the repository.

#### Exporting Critical Tables as CSV

For a lightweight backup of application data:

```bash
# Using the Supabase CLI
supabase db dump --data-only \
  --table profiles \
  --table exhibitions \
  --table artworks \
  --table catalogs \
  > rongdhonu-data-$(date +%Y%m%d).sql
```

---

### Restoring from Backup

#### From a Supabase Automated Backup

1. Go to **Database → Backups** in the Supabase Dashboard.
2. Click **Restore** next to the desired backup.
3. Confirm the restore. **This will overwrite the current database.**
4. After restoration, verify the data by checking recent records in the Table Editor.
5. Trigger a new Vercel deployment to clear any server-side caches.

#### From a `pg_dump` File

```bash
pg_restore \
  --no-owner \
  --no-acl \
  -d "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" \
  rongdhonu-backup-20241201-120000.dump
```

> **Warning:** Restoration from a dump file **replaces** all table data. Run this only on a staging project to test, or on production as a last resort after confirming the backup is clean.

---

### Running Migrations

All schema changes are managed via SQL migration files in `supabase/migrations/`. Never alter the production schema manually via the SQL Editor without a corresponding migration file.

**To add a new migration:**

```bash
# Create a new migration file
supabase migration new add_artwork_dimensions

# Edit the generated file in supabase/migrations/
# Then push to production
supabase db push
```

**To check migration status:**

```bash
supabase migration list
```

This shows which migrations have been applied and which are pending.

---

### Monitoring Table Growth

Run this query monthly in the Supabase SQL Editor to identify fast-growing tables:

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

The `audit_logs` and `notifications` tables are the most likely to grow large over time.

---

### Cleaning Up Old Notifications

Read notifications older than 90 days can be safely deleted:

```sql
DELETE FROM public.notifications
WHERE read_status = true
  AND created_at < NOW() - INTERVAL '90 days';
```

Run this as a scheduled query or include it in a monthly maintenance script.

Optionally, archive `audit_logs` older than 1 year to a separate archival table or export them to CSV before deletion:

```sql
-- Export old audit logs to a temp table before deletion
CREATE TABLE IF NOT EXISTS public.audit_logs_archive AS
  SELECT * FROM public.audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- Verify the archive
SELECT COUNT(*) FROM public.audit_logs_archive;

-- Then delete from the main table (requires disabling the RLS policy temporarily via service role)
DELETE FROM public.audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Storage Maintenance

### Orphaned Files Cleanup

Files can become orphaned in Supabase Storage when a database record is deleted without deleting the corresponding storage object. Run this query to find orphaned artwork images:

```sql
-- Find artwork storage objects with no corresponding database record
-- (Run in Supabase SQL Editor)
SELECT
  so.name AS storage_path,
  so.created_at
FROM storage.objects so
WHERE so.bucket_id = 'artworks'
  AND NOT EXISTS (
    SELECT 1 FROM public.artworks a
    WHERE so.name LIKE '%' || a.id::text || '%'
  )
ORDER BY so.created_at DESC;
```

Review the results before deleting. To delete an orphaned object:

```bash
# Using Supabase CLI or management API
supabase storage rm artworks/path/to/orphaned-file.jpg
```

Repeat for the `avatars`, `catalogs`, and `exhibitions` buckets as needed.

---

### Storage Usage Monitoring

In the Supabase Dashboard, navigate to **Storage** to see total storage usage by bucket. Key thresholds:

| Bucket | Alert threshold | Action |
|---|---|---|
| `artworks` | 4 GB | Consider compressing uploaded images at ingestion |
| `catalogs` | 1 GB | Archive old exhibition PDFs off-platform |
| `exhibitions` | 2 GB | Remove duplicate or unused gallery media |

The free Supabase tier includes 1 GB of storage. The Pro tier includes 100 GB. Upgrade before exhibiting at scale.

---

## Application Monitoring

### Vercel Analytics & Logs

1. Open the [Vercel Dashboard](https://vercel.com) and select the Rongdhonu project.
2. Click **Analytics** to see page views, load times, and Core Web Vitals.
3. Click **Functions** to see API route execution times and error rates.
4. Click **Logs** (Runtime Logs) to see live server logs.

**Key metrics to watch:**

| Metric | Target | Concern level |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | > 4s is critical |
| `/api/catalogs/download` P99 | < 500ms | > 2s indicates Supabase Storage issue |
| 5xx error rate | < 0.1% | > 1% needs investigation |

### Supabase Logs

In the Supabase Dashboard, navigate to **Logs**:

- **API Logs** — All Supabase API requests. Filter by status code `4xx` or `5xx` to spot errors.
- **Postgres Logs** — Database query logs. Useful for identifying slow queries.
- **Auth Logs** — Login attempts, failures, and token refreshes.

To find slow queries (> 1 second):

```sql
-- In the Supabase SQL Editor
SELECT
  query,
  calls,
  total_exec_time / calls AS avg_time_ms,
  rows / calls AS avg_rows
FROM pg_stat_statements
WHERE total_exec_time / calls > 1000
ORDER BY avg_time_ms DESC
LIMIT 20;
```

### Edge Function Logs

In the Supabase Dashboard, navigate to **Edge Functions → send-email → Logs**.

Filter for errors. Common issues:

| Log message | Cause | Fix |
|---|---|---|
| `Missing RESEND_API_KEY` | Secret not set | Run `supabase secrets set RESEND_API_KEY=...` |
| `403 Forbidden` from Resend | Sending domain not verified | Verify domain in Resend dashboard |
| `Invalid request body` | Malformed JSON from caller | Check the Server Action that calls the function |

### Setting Up Uptime Monitoring

Use a free uptime monitoring service to get alerted if the platform goes down:

**Recommended: [Uptime Robot](https://uptimerobot.com) (free tier)**

1. Create an account at uptimerobot.com.
2. Add a new monitor:
   - **Monitor type:** HTTP(s)
   - **URL:** `https://rongdhonu.vercel.app/`
   - **Monitoring interval:** 5 minutes
3. Add alert contacts (email/SMS) for the technical team.

This provides immediate notification of outages without additional infrastructure.

---

## Performance Tuning

### Database Indexes

The following indexes should exist on the Rongdhonu database. Verify them periodically, especially after new migrations:

```sql
-- Verify existing indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Required indexes:**

```sql
-- artworks: common query patterns
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_exhibition_id ON public.artworks(exhibition_id);

-- notifications: fetching unread notifications per user
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, read_status)
  WHERE read_status = false;

-- audit_logs: time-range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);

-- gallery_media: per-exhibition gallery queries
CREATE INDEX IF NOT EXISTS idx_gallery_media_exhibition_id ON public.gallery_media(exhibition_id);

-- catalogs: published catalogs query
CREATE INDEX IF NOT EXISTS idx_catalogs_status ON public.catalogs(status);
```

### Next.js Caching Strategy

The Rongdhonu App Router uses the following caching approach:

| Route | Cache strategy | Revalidation |
|---|---|---|
| `/` (home) | `revalidate: 3600` | Hourly |
| `/exhibitions` | `revalidate: 1800` | Every 30 min |
| `/artists` | `revalidate: 3600` | Hourly |
| `/catalogs` | `revalidate: 900` | Every 15 min |
| `/gallery` | `revalidate: 1800` | Every 30 min |
| `/dashboard/*` | `no-store` | Never cached (auth-gated) |
| `/admin/*` | `no-store` | Never cached (auth-gated) |
| `/api/catalogs/download` | `no-store` | Never cached |

When content is updated (e.g., a catalog is published), manually revalidate the relevant paths using Next.js on-demand revalidation:

```typescript
// In the server action that publishes a catalog
import { revalidatePath } from 'next/cache'

revalidatePath('/catalogs')
revalidatePath('/') // If the home page shows recent catalogs
```

### Image Optimisation

All images served via `next/image` are automatically optimised by Vercel. Ensure all images use the `<Image>` component from `next/image` rather than raw `<img>` tags.

For Supabase Storage images, use transformation parameters where supported:

```typescript
// Requesting a 400×400 thumbnail from Supabase Storage
const thumbnailUrl = `${supabaseUrl}/storage/v1/render/image/public/artworks/${path}?width=400&height=400&resize=contain`
```

---

## Security Maintenance

### Rotating Secrets

Rotate all credentials **immediately** if you suspect a leak, or as part of quarterly maintenance:

**1. Supabase Service Role Key**

1. In Supabase Dashboard → **Project Settings → API**, click **Regenerate** next to `service_role`.
2. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables.
3. Trigger a new Vercel deployment.
4. Update the key used by Edge Functions:
   ```bash
   # If you call Supabase functions using the service role from within edge functions
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=new_key
   supabase functions deploy send-email
   ```

**2. Resend API Key**

1. In the [Resend Dashboard](https://resend.com), go to **API Keys** and create a new key. Delete the old one.
2. Update the Supabase secret:
   ```bash
   supabase secrets set RESEND_API_KEY=re_new_key
   supabase functions deploy send-email
   ```

**3. Supabase Anon Key**

Rotating the anon key is disruptive as it requires all clients to re-authenticate. Only rotate if there is evidence of misuse. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel and redeploy.

### Reviewing Audit Logs

Review the audit log monthly for anomalous activity. Key patterns to watch:

- Multiple `user.role_changed` entries in a short period (possible privilege escalation)
- `artwork.approved` entries for artworks that have no submission from a known artist
- Any `admin` actions performed at unusual hours
- Large numbers of failed login attempts (check Supabase Auth logs)

In the admin panel, navigate to **Admin → Audit Logs** and set the date range to the past 30 days. Export to CSV if a detailed investigation is needed.

### Dependency Updates

Run monthly to stay current with security patches:

```bash
# Check for outdated packages
pnpm outdated

# Update non-breaking (patch + minor) versions
pnpm update

# Check for major version updates manually
pnpm outdated | grep -v "^Package"
```

After updating dependencies:

1. Run `pnpm typecheck && pnpm lint && pnpm build` to verify nothing is broken.
2. Test key flows (login, artwork submission, catalog download) in a preview deployment before merging to `main`.

Pay particular attention to updates for:
- `next` — Breaking changes can affect App Router behaviour
- `@supabase/ssr` — Auth and session management
- `next-intl` — Locale routing middleware

---

## Incident Response Runbooks

### Runbook: Site is Down (5xx / Cannot Connect)

**Symptoms:** Users report the website is inaccessible or returning 500 errors.

**Step 1 — Check Vercel status**
- Visit [vercel-status.com](https://www.vercel-status.com) to see if there is a platform-wide incident.
- If Vercel is experiencing an incident, wait for resolution — no action needed on your end.

**Step 2 — Check your Vercel deployment**
- In the Vercel Dashboard, check the **Deployments** tab. Is the last deployment marked as failed?
- If so, check the build logs for errors. Common causes: TypeScript compilation errors, missing environment variables.
- Roll back to the last good deployment (see [DEPLOYMENT.md → Rollback Procedure](./DEPLOYMENT.md#rollback-procedure)).

**Step 3 — Check Supabase status**
- Visit [status.supabase.com](https://status.supabase.com).
- If Supabase is down, the application cannot serve dynamic content. Static pages may still work.
- If your Supabase project is paused (happens on the free tier after 7 days of inactivity), click **Restore** in the Supabase Dashboard.

**Step 4 — Check environment variables**
- In Vercel → Settings → Environment Variables, verify all required variables are present and not empty.
- Redeploy if any variable was recently changed.

**Step 5 — Check Runtime Logs**
- In Vercel → Logs, filter for `Error` level messages.
- Look for `NEXT_PUBLIC_SUPABASE_URL is not defined` or similar, which indicate missing environment variables at runtime.

---

### Runbook: Emails Not Being Delivered

**Symptoms:** Artists report not receiving artwork approval/rejection emails. Admins report the `send-email` function appears to succeed but emails don't arrive.

**Step 1 — Check Resend Dashboard**
- Log in to [resend.com](https://resend.com) and navigate to **Emails**.
- Search for the recipient's email address.
- Check the delivery status: `Delivered`, `Bounced`, `Spam`, or `Queued`.

**Step 2 — Check Edge Function logs**
- In Supabase Dashboard → **Edge Functions → send-email → Logs**.
- Look for error messages. Common issues:
  - `Missing RESEND_API_KEY`: Run `supabase secrets set RESEND_API_KEY=re_...`
  - `403 Forbidden`: Your sending domain (`mail.rongdhonu.com`) is not verified in Resend. Complete domain verification.
  - `422 Unprocessable Entity`: The `to` email address is invalid or bounced previously. Check the Resend suppression list.

**Step 3 — Check the Resend suppression list**
- In the Resend Dashboard, navigate to **Suppressions**.
- If the recipient's email is suppressed (e.g., due to a previous bounce), remove it from the suppression list.

**Step 4 — Verify sending domain**
- In Resend Dashboard → **Domains**, verify that your sending domain shows `Verified` status.
- If DNS records are missing or have TTL issues, re-add the required DKIM and SPF records in your domain registrar.

**Step 5 — Manual test**
- Use the curl command from [DEPLOYMENT.md → Step 5.3](./DEPLOYMENT.md#53-test-the-function) to manually trigger the Edge Function and verify the response.

---

### Runbook: Catalog Downloads Failing

**Symptoms:** Users click the download button and see an error, or the downloaded file is corrupted/empty.

**Step 1 — Check the API route response**
```bash
curl -v "https://rongdhonu.vercel.app/api/catalogs/download?id=<catalog-uuid>"
```
- `400` → The `id` is malformed or missing. Check the client-side code passing the ID.
- `404` → The catalog is not `published` in the database. An admin must publish it.
- `500` → Supabase Storage signing failed. Continue to Step 2.

**Step 2 — Check Supabase Storage**
- In Supabase Dashboard → **Storage → catalogs**, verify the PDF file exists at the path stored in `catalogs.pdf_url`.
- If the file is missing, re-upload it via the admin panel.

**Step 3 — Check service role key**
- The download route uses the service role key to sign URLs. Verify `SUPABASE_SERVICE_ROLE_KEY` is correctly set in Vercel environment variables.
- If the key was recently rotated, ensure the new key is deployed.

**Step 4 — Check Vercel function logs**
- In Vercel → Logs, filter by the `/api/catalogs/download` route.
- Look for `StorageError` or `JwtError` messages.

**Step 5 — Test signing manually**
- In the Supabase SQL Editor, test the signing function:
```sql
SELECT storage.sign('catalogs', 'path/to/catalog.pdf', 60);
```
- If this returns an error, there is a Supabase Storage configuration issue.

---

### Runbook: Admin Cannot Log In

**Symptoms:** An admin or committee member cannot access the `/admin` panel, receiving a 403 error or redirect to login.

**Step 1 — Verify the user's session**
- Ask the user to log out completely and log in again.
- If login fails, use the Supabase Dashboard → **Authentication → Users** to verify the user's account is not banned or unconfirmed.

**Step 2 — Verify the user's role**
```sql
SELECT id, email, role FROM public.profiles WHERE email = 'admin@example.com';
```
- If `role` is `member`, update it:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
  ```

**Step 3 — Check the middleware**
- Ensure `middleware.ts` correctly reads the role from the session/profile and protects `/admin/*` routes.
- Check Vercel logs for any middleware errors on the `/admin` path.

**Step 4 — Force a session refresh**
- The user may have a cached JWT with the old role. Ask them to:
  1. Log out.
  2. Clear browser cookies for `rongdhonu.vercel.app`.
  3. Log in again.
- JWT expiry is set to 1 hour; the new role will be reflected after a token refresh.

---

### Runbook: Database is at Capacity

**Symptoms:** Supabase sends an alert that the database is approaching the storage limit; new inserts may fail.

**Step 1 — Identify the largest tables**
```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC;
```

**Step 2 — Clean up old notifications (safe)**
```sql
DELETE FROM public.notifications
WHERE read_status = true AND created_at < NOW() - INTERVAL '90 days';
```

**Step 3 — Archive old audit logs**

Export old audit logs to a CSV file, then delete them from the main table (see [Cleaning Up Old Notifications](#cleaning-up-old-notifications) for the archival pattern).

**Step 4 — Upgrade Supabase plan**

If data growth is expected to continue, upgrade to the **Pro plan** (8 GB included) or add a database addon. Do this in the Supabase Dashboard under **Billing**.

---

## Annual Exhibition Checklist

Run this checklist **2 weeks before** each new exhibition opens and **after** each exhibition closes.

### Before the Exhibition Opens

- [ ] Create the new exhibition record in the admin panel with status `upcoming`.
- [ ] Upload the hero image (minimum 1920×600px).
- [ ] Update venue information in English and Bengali.
- [ ] Confirm submission deadline and communicate to members.
- [ ] Set the submission deadline in the platform announcement.
- [ ] Verify the `send-email` Edge Function is working (run a test email).
- [ ] Confirm Resend sending domain is verified and not close to monthly email limit.
- [ ] Take a manual database backup before the submission period opens.
- [ ] Increase Supabase plan if storage is above 70% capacity.

### During the Exhibition

- [ ] Monitor the artwork moderation queue daily.
- [ ] Respond to all artwork submissions within 7 working days.
- [ ] Upload gallery media as the exhibition progresses.
- [ ] Prepare the catalog PDF (coordinate with the design team).

### After the Exhibition Closes

- [ ] Set the exhibition status to `past`.
- [ ] Upload and publish the exhibition catalog.
- [ ] Verify catalog download is working and the counter increments.
- [ ] Update artist profiles with the new exhibition participation.
- [ ] Archive the committee member listing for the year.
- [ ] Take a final database backup.
- [ ] Clean up old notifications from the closed exhibition period.
- [ ] Review the audit log for the exhibition period and archive it if needed.
