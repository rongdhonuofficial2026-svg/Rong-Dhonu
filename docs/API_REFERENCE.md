# API Reference — Rongdhonu

This document covers all API routes, Supabase Edge Functions, database tables, RLS policies, and storage buckets in the Rongdhonu platform.

---

## Table of Contents

- [Next.js API Routes](#nextjs-api-routes)
  - [GET /api/catalogs/download](#get-apicatalogsdownload)
- [Supabase Edge Functions](#supabase-edge-functions)
  - [send-email](#send-email)
- [Database Tables](#database-tables)
  - [profiles](#profiles)
  - [exhibitions](#exhibitions)
  - [artworks](#artworks)
  - [catalogs](#catalogs)
  - [notifications](#notifications)
  - [audit_logs](#audit_logs)
  - [gallery_media](#gallery_media)
  - [committee_members](#committee_members)
  - [exhibition_participants](#exhibition_participants)
  - [events](#events)
- [Row Level Security Policies](#row-level-security-policies)
- [Supabase Storage Buckets](#supabase-storage-buckets)
- [Postgres Functions](#postgres-functions)

---

## Next.js API Routes

### `GET /api/catalogs/download`

Generates a short-lived signed URL for downloading a published catalog PDF and atomically increments the download counter.

**File:** `app/api/catalogs/download/route.ts`

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `string` (UUID) | ✅ | The `id` of the catalog to download |

#### Responses

**200 OK**

```json
{
  "url": "https://abcdef.supabase.co/storage/v1/object/sign/catalogs/2024/catalog-v2.pdf?token=eyJ..."
}
```

The signed URL expires after **60 seconds**. The client should redirect to it immediately.

**400 Bad Request** — `id` parameter is missing or not a valid UUID.

```json
{ "error": "Missing or invalid catalog id." }
```

**404 Not Found** — Catalog does not exist or is not `published`.

```json
{ "error": "Catalog not found or not available for download." }
```

**500 Internal Server Error** — Supabase Storage signing failed.

```json
{ "error": "Failed to generate download URL. Please try again." }
```

#### Implementation Notes

- This route uses `createAdminClient()` (service role) to generate the signed URL because the `catalogs` storage bucket is private.
- The download counter is incremented via the `increment_catalog_downloads(catalog_id uuid)` Postgres function to avoid race conditions.
- No authentication is required — published catalogs are publicly downloadable. Drafts and archived catalogs return 404.

#### Example Client Usage

```typescript
// components/CatalogCard.tsx
const handleDownload = async (catalogId: string) => {
  const res = await fetch(`/api/catalogs/download?id=${catalogId}`)
  if (!res.ok) {
    const { error } = await res.json()
    toast.error(error)
    return
  }
  const { url } = await res.json()
  window.open(url, '_blank')
}
```

---

## Supabase Edge Functions

### `send-email`

**File:** `supabase/functions/send-email/index.ts`

**Trigger:** Called from Server Actions or other server-side code after database mutations (e.g., artwork approval, new catalog published).

**Runtime:** Deno (Supabase Edge Runtime)

**Authentication:** Requires the `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` header. Requests without a valid service role token are rejected with `401`.

#### Request

`POST https://<project-ref>.supabase.co/functions/v1/send-email`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

**Body:**

```json
{
  "to": "artist@example.com",
  "subject": "Your artwork has been approved",
  "template": "artwork-approved",
  "data": {
    "artistName": "Karim Mia",
    "artworkTitle": "রঙের মেলা",
    "exhibitionYear": 2024,
    "dashboardUrl": "https://rongdhonu.vercel.app/dashboard/artworks"
  }
}
```

#### Supported Templates

| `template` value | Description | Required `data` fields |
|---|---|---|
| `artwork-approved` | Sent when an admin approves an artwork | `artistName`, `artworkTitle`, `exhibitionYear`, `dashboardUrl` |
| `artwork-rejected` | Sent when an admin rejects an artwork | `artistName`, `artworkTitle`, `reason`, `dashboardUrl` |
| `catalog-published` | Sent to all opted-in members when a catalog is published | `catalogTitle`, `exhibitionYear`, `catalogUrl` |
| `password-reset` | Triggered by Supabase Auth hook | `resetLink` |
| `welcome` | Sent after a new member profile is created | `name`, `loginUrl` |

#### Response

**200 OK**

```json
{ "id": "resend-message-id-abc123" }
```

**400 Bad Request** — Missing or invalid template or `to` field.

```json
{ "error": "Invalid request body." }
```

**401 Unauthorized** — Missing or invalid service role token.

**500 Internal Server Error** — Resend API returned an error.

```json
{ "error": "Email delivery failed.", "details": "..." }
```

#### Calling from a Server Action

```typescript
// lib/email.ts
export async function sendEmail(payload: SendEmailPayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    }
  )
  if (!res.ok) {
    const error = await res.json()
    console.error('[send-email]', error)
  }
}
```

---

## Database Tables

### `profiles`

Extends Supabase Auth `auth.users`. Created automatically via a trigger on `auth.users` insert.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Foreign key → `auth.users.id`, Primary Key |
| `role` | `text` | No | One of `admin`, `member`, `committee` |
| `full_name_en` | `text` | Yes | Full name in English |
| `full_name_bn` | `text` | Yes | Full name in Bengali |
| `bio_en` | `text` | Yes | Biography in English (up to 1000 chars) |
| `bio_bn` | `text` | Yes | Biography in Bengali (up to 1000 chars) |
| `email` | `text` | No | Synced from `auth.users.email` |
| `avatar_url` | `text` | Yes | Supabase Storage URL for profile photo |
| `notify_email` | `boolean` | No | Whether to send transactional emails (default `true`) |
| `notify_in_app` | `boolean` | No | Whether to show in-app notifications (default `true`) |
| `notify_artwork_updates` | `boolean` | No | Artwork approval/rejection emails (default `true`) |
| `created_at` | `timestamptz` | No | Auto-set on insert |
| `updated_at` | `timestamptz` | No | Auto-updated by trigger |

---

### `exhibitions`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `year` | `integer` | No | Exhibition year (unique) |
| `theme_en` | `text` | No | Theme/title in English |
| `theme_bn` | `text` | No | Theme/title in Bengali |
| `status` | `text` | No | `draft`, `upcoming`, `active`, `past` |
| `start_date` | `date` | Yes | Opening date |
| `end_date` | `date` | Yes | Closing date |
| `venue_en` | `text` | Yes | Venue name/address in English |
| `venue_bn` | `text` | Yes | Venue name/address in Bengali |
| `hero_image_url` | `text` | Yes | Supabase Storage URL for hero banner |
| `created_at` | `timestamptz` | No | Auto-set on insert |

---

### `artworks`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `artist_id` | `uuid` | No | Foreign key → `profiles.id` |
| `exhibition_id` | `uuid` | Yes | Foreign key → `exhibitions.id` |
| `title_en` | `text` | No | Artwork title in English |
| `title_bn` | `text` | Yes | Artwork title in Bengali |
| `status` | `text` | No | `pending`, `approved`, `rejected` |
| `main_image_url` | `text` | No | Supabase Storage URL (primary image) |
| `medium_en` | `text` | Yes | Medium description (e.g., "Oil on canvas") |
| `medium_bn` | `text` | Yes | Medium description in Bengali |
| `price` | `numeric(12,2)` | Yes | Listed price in BDT (null = not for sale) |
| `rejection_reason` | `text` | Yes | Populated by admin on rejection |
| `created_at` | `timestamptz` | No | Auto-set on insert |
| `updated_at` | `timestamptz` | No | Auto-updated by trigger |

---

### `catalogs`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `exhibition_id` | `uuid` | No | Foreign key → `exhibitions.id` |
| `title_en` | `text` | No | Catalog title in English |
| `title_bn` | `text` | Yes | Catalog title in Bengali |
| `pdf_url` | `text` | No | Supabase Storage path (private bucket) |
| `cover_image_url` | `text` | Yes | Supabase Storage URL for cover thumbnail |
| `status` | `text` | No | `draft`, `published`, `archived` |
| `version` | `integer` | No | Version number (starts at 1, incremented on re-upload) |
| `language` | `text` | No | `en`, `bn`, or `both` |
| `total_downloads` | `integer` | No | Atomic download counter (default `0`) |
| `created_at` | `timestamptz` | No | Auto-set on insert |
| `published_at` | `timestamptz` | Yes | Set when status changes to `published` |

---

### `notifications`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `user_id` | `uuid` | No | Foreign key → `profiles.id` |
| `type` | `text` | No | `artwork_approved`, `artwork_rejected`, `catalog_published`, `general` |
| `message_en` | `text` | No | Notification body in English |
| `message_bn` | `text` | Yes | Notification body in Bengali |
| `read_status` | `boolean` | No | Whether user has read it (default `false`) |
| `entity_type` | `text` | Yes | Related entity: `artwork`, `catalog`, `exhibition` |
| `entity_id` | `uuid` | Yes | ID of the related entity |
| `created_at` | `timestamptz` | No | Auto-set on insert |

---

### `audit_logs`

Append-only. No `UPDATE` or `DELETE` permitted via RLS.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `actor_id` | `uuid` | No | Foreign key → `profiles.id` (who performed the action) |
| `action` | `text` | No | e.g., `artwork.approved`, `catalog.published`, `user.role_changed` |
| `entity_type` | `text` | No | e.g., `artwork`, `catalog`, `profile` |
| `entity_id` | `uuid` | Yes | ID of the affected record |
| `details` | `jsonb` | Yes | Additional context (before/after state, rejection reason, etc.) |
| `created_at` | `timestamptz` | No | Auto-set on insert |

---

### `gallery_media`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `exhibition_id` | `uuid` | No | Foreign key → `exhibitions.id` |
| `category` | `text` | Yes | `opening-night`, `artwork`, `behind-the-scenes`, `award-ceremony` |
| `media_type` | `text` | No | `image` or `video` |
| `url` | `text` | No | Supabase Storage URL |
| `caption_en` | `text` | Yes | Caption in English |
| `caption_bn` | `text` | Yes | Caption in Bengali |
| `sort_order` | `integer` | No | Display order within category (default `0`) |
| `created_at` | `timestamptz` | No | Auto-set on insert |

---

### `committee_members`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `profile_id` | `uuid` | No | Foreign key → `profiles.id` |
| `title_en` | `text` | Yes | Role title in English (e.g., "Exhibition Secretary") |
| `title_bn` | `text` | Yes | Role title in Bengali |
| `year` | `integer` | No | Committee year |
| `sort_order` | `integer` | No | Display order on committee page |

---

### `exhibition_participants`

Join table linking artists to exhibitions they participate in.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `exhibition_id` | `uuid` | No | Foreign key → `exhibitions.id` |
| `artist_id` | `uuid` | No | Foreign key → `profiles.id` |
| `participation_year` | `integer` | No | Year of participation |

Unique constraint: `(exhibition_id, artist_id)`.

---

### `events`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary Key |
| `exhibition_id` | `uuid` | No | Foreign key → `exhibitions.id` |
| `title_en` | `text` | No | Event title in English |
| `title_bn` | `text` | Yes | Event title in Bengali |
| `description_en` | `text` | Yes | Description in English |
| `description_bn` | `text` | Yes | Description in Bengali |
| `event_date` | `timestamptz` | No | Date and time of the event |
| `location_en` | `text` | Yes | Location in English |
| `location_bn` | `text` | Yes | Location in Bengali |

---

## Row Level Security Policies

All tables have RLS enabled. The following is a summary of the key policies.

### Helper Functions

```sql
-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns true if the current user is an admin or committee member
CREATE OR REPLACE FUNCTION public.is_admin_or_committee()
RETURNS boolean AS $$
  SELECT current_user_role() IN ('admin', 'committee')
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### `profiles`

| Operation | Allowed for |
|---|---|
| SELECT | Own row: any authenticated user. All rows: `admin`, `committee`. Public columns (name, bio, avatar): any user (for artist directory). |
| INSERT | Supabase Auth trigger only (service role). |
| UPDATE | Own row: any authenticated user (limited columns). Any row: `admin` only. |
| DELETE | `admin` only. |

### `artworks`

| Operation | Allowed for |
|---|---|
| SELECT | Own artworks: authenticated owner. `approved` artworks: any user (public). All: `admin`, `committee`. |
| INSERT | Authenticated users with `member` or `committee` role. |
| UPDATE | Own `pending` artworks (limited fields): owner. Any artwork status: `admin`, `committee`. |
| DELETE | `admin` only. |

### `catalogs`

| Operation | Allowed for |
|---|---|
| SELECT | `published` catalogs: any user. All statuses: `admin`, `committee`. |
| INSERT / UPDATE / DELETE | `admin`, `committee` only. |

### `notifications`

| Operation | Allowed for |
|---|---|
| SELECT | Own notifications only. |
| UPDATE (`read_status` only) | Own notifications only. |
| INSERT / DELETE | Service role only (created by server actions). |

### `audit_logs`

| Operation | Allowed for |
|---|---|
| SELECT | `admin` only. |
| INSERT | Service role only. |
| UPDATE / DELETE | Nobody (append-only). |

### `gallery_media`

| Operation | Allowed for |
|---|---|
| SELECT | Any user (public). |
| INSERT / UPDATE / DELETE | `admin`, `committee` only. |

---

## Supabase Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `avatars` | ✅ Public | User profile photos |
| `artworks` | ✅ Public | Artwork images (approved artworks are publicly viewable) |
| `catalogs` | ❌ Private | PDF catalogs (access via signed URL from `/api/catalogs/download`) |
| `exhibitions` | ✅ Public | Hero images, gallery media |
| `covers` | ✅ Public | Catalog cover thumbnail images |

**Storage path conventions:**

```
avatars/     {user_id}/avatar.{ext}
artworks/    {exhibition_id}/{artwork_id}/main.{ext}
             {exhibition_id}/{artwork_id}/detail-{n}.{ext}
catalogs/    {exhibition_year}/catalog-v{version}.pdf
exhibitions/ {exhibition_id}/hero.{ext}
             {exhibition_id}/gallery/{media_id}.{ext}
covers/      {catalog_id}/cover.{ext}
```

---

## Postgres Functions

### `increment_catalog_downloads(p_catalog_id uuid)`

Atomically increments the `total_downloads` counter for a catalog. Called from `/api/catalogs/download`.

```sql
CREATE OR REPLACE FUNCTION public.increment_catalog_downloads(p_catalog_id uuid)
RETURNS void AS $$
  UPDATE public.catalogs
  SET total_downloads = total_downloads + 1
  WHERE id = p_catalog_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

### `handle_new_user()`

Trigger function that creates a `profiles` row when a new user signs up via Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### `set_updated_at()`

Trigger function that keeps `updated_at` columns current.

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to: `profiles`, `artworks`.
