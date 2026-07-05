# Admin & Committee Manual — Rongdhonu

This manual is the complete operational guide for Rongdhonu platform administrators and committee members. It covers every task available in the `/admin` panel.

---

## Table of Contents

- [Roles and Permissions](#roles-and-permissions)
- [Accessing the Admin Panel](#accessing-the-admin-panel)
- [Dashboard Overview](#dashboard-overview)
- [Exhibition Management](#exhibition-management)
  - [Creating an Exhibition](#creating-an-exhibition)
  - [Editing an Exhibition](#editing-an-exhibition)
  - [Changing Exhibition Status](#changing-exhibition-status)
- [Artwork Moderation](#artwork-moderation)
  - [Reviewing Pending Artworks](#reviewing-pending-artworks)
  - [Approving an Artwork](#approving-an-artwork)
  - [Rejecting an Artwork](#rejecting-an-artwork)
  - [Bulk Operations](#bulk-operations)
- [Catalog Management](#catalog-management)
  - [Creating a Catalog](#creating-a-catalog)
  - [Uploading a PDF](#uploading-a-pdf)
  - [Publishing a Catalog](#publishing-a-catalog)
  - [Archiving a Catalog](#archiving-a-catalog)
- [Gallery Media Management](#gallery-media-management)
- [User Management](#user-management)
  - [Viewing All Users](#viewing-all-users)
  - [Changing a User's Role](#changing-a-users-role)
  - [Deactivating a User](#deactivating-a-user)
- [Notifications](#notifications)
  - [Sending a Broadcast Notification](#sending-a-broadcast-notification)
- [Audit Logs](#audit-logs)
- [Committee Member Configuration](#committee-member-configuration)

---

## Roles and Permissions

The platform has three privileged roles. The `admin` role is a superset of `committee`.

| Capability | `member` | `committee` | `admin` |
|---|---|---|---|
| Submit artworks | ✅ | ✅ | ✅ |
| View own dashboard | ✅ | ✅ | ✅ |
| Access `/admin` panel | ❌ | ✅ | ✅ |
| Approve/reject artworks | ❌ | ✅ | ✅ |
| Create/edit exhibitions | ❌ | ✅ | ✅ |
| Create/publish catalogs | ❌ | ✅ | ✅ |
| Manage gallery media | ❌ | ✅ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| Delete any record | ❌ | ❌ | ✅ |

---

## Accessing the Admin Panel

1. Log in at `https://rongdhonu.vercel.app/login` with your admin or committee account.
2. Navigate to `https://rongdhonu.vercel.app/admin` (or click the **Admin Panel** link in your dashboard sidebar).
3. If you see a 403 error, your account does not have the `admin` or `committee` role. Contact an administrator to update your role (see [Changing a User's Role](#changing-a-users-role)).

---

## Dashboard Overview

The admin dashboard (`/admin`) shows:

- **Pending artworks** — Count of artworks awaiting review. Click to go directly to the moderation queue.
- **Active exhibitions** — Current exhibition status and dates.
- **Draft catalogs** — Catalogs awaiting publication.
- **Recent audit log** — Last 10 admin actions across all users.
- **User statistics** — Total members, committee members, artists with approved artworks.

---

## Exhibition Management

### Creating an Exhibition

1. Navigate to **Admin → Exhibitions → New Exhibition** (`/admin/exhibitions/new`).
2. Fill in all required fields:

   | Field | Description |
   |---|---|
   | **Year** | The exhibition year (e.g., `2025`). Must be unique. |
   | **Theme (English)** | Theme or title in English (e.g., "Colours of Bengal") |
   | **Theme (Bengali)** | Theme or title in Bengali (e.g., "বাংলার রং") |
   | **Status** | Set to `draft` for a new exhibition not yet announced. |
   | **Start Date** | Opening date of the exhibition. |
   | **End Date** | Closing date. May be left blank for ongoing exhibitions. |
   | **Venue (English)** | Full venue name and address in English. |
   | **Venue (Bengali)** | Full venue name and address in Bengali. |
   | **Hero Image** | Upload a banner image (minimum 1920×600px, JPG or WebP). |

3. Click **Create Exhibition**. The exhibition is saved with `draft` status and is not visible to the public.

### Editing an Exhibition

1. Navigate to **Admin → Exhibitions**.
2. Click **Edit** next to the exhibition you want to modify.
3. Update the required fields and click **Save Changes**.
4. Changes take effect immediately (no re-publish step required).

> **Note:** Editing the hero image replaces the previous image in Supabase Storage. The old file is deleted automatically.

### Changing Exhibition Status

| Status | Visibility | Description |
|---|---|---|
| `draft` | Admin/committee only | Work in progress, not public |
| `upcoming` | Public | Announced but not yet open |
| `active` | Public | Currently open |
| `past` | Public | Exhibition has ended |

To change the status:
1. Open the exhibition editor.
2. Change the **Status** dropdown.
3. Click **Save Changes**.

---

## Artwork Moderation

### Reviewing Pending Artworks

1. Navigate to **Admin → Artworks** (`/admin/artworks`).
2. Use the **Status** filter to select **Pending** to see artworks awaiting review.
3. Each card shows: artist name, artwork title (bilingual), submission date, and thumbnail.
4. Click an artwork to open the full detail view, which includes the full-size image, medium, price, and artist profile.

### Approving an Artwork

1. Open the artwork detail view.
2. Click **Approve**.
3. Confirm the action in the dialog.

**What happens automatically:**
- The artwork's `status` changes to `approved`.
- An in-app notification is created for the artist.
- If the artist has `notify_artwork_updates = true`, the `send-email` Edge Function is called with the `artwork-approved` template.
- An entry is written to `audit_logs` with `action: 'artwork.approved'`.

### Rejecting an Artwork

1. Open the artwork detail view.
2. Click **Reject**.
3. In the **Rejection Reason** field, provide a clear, constructive explanation (e.g., "Image resolution is too low — please resubmit at 300 DPI or higher."). This text is shown to the artist.
4. Click **Confirm Rejection**.

**What happens automatically:**
- The artwork's `status` changes to `rejected` and `rejection_reason` is populated.
- The artist receives an in-app notification and email (if opted in) with the rejection reason.
- An audit log entry is created.

> **Best practice:** Always provide a specific, actionable rejection reason. Vague reasons like "Not suitable" are unhelpful and may frustrate artists.

### Bulk Operations

For efficiency during high-volume submission periods:

1. Navigate to **Admin → Artworks** and filter to **Pending**.
2. Use the checkboxes to select multiple artworks.
3. Click **Bulk Actions** dropdown:
   - **Approve Selected** — Approves all selected artworks in one operation.
   - **Reject Selected** — Opens a dialog to enter a single rejection reason applied to all selected artworks.

> Bulk rejections require a rejection reason before the action can be confirmed. Bulk approvals do not.

---

## Catalog Management

### Creating a Catalog

1. Navigate to **Admin → Catalogs → New Catalog** (`/admin/catalogs/new`).
2. Fill in:

   | Field | Description |
   |---|---|
   | **Exhibition** | Select the associated exhibition from the dropdown. |
   | **Title (English)** | Catalog title in English (e.g., "Rongdhonu 2024 Exhibition Catalog") |
   | **Title (Bengali)** | Catalog title in Bengali |
   | **Language** | `en`, `bn`, or `both` — indicates what language the PDF is in. |
   | **Cover Image** | Upload a thumbnail image (500×700px recommended, JPG or WebP). |

3. Click **Create Catalog**. The catalog is created with `status: draft` and `version: 1`.

### Uploading a PDF

1. Open the catalog editor.
2. In the **PDF File** section, click **Upload PDF**.
3. Select the catalog PDF file (max 50 MB).
4. The file is uploaded to the private `catalogs` Supabase Storage bucket at path `{exhibition_year}/catalog-v{version}.pdf`.
5. Click **Save**.

> If you replace the PDF (e.g., to fix an error), the version number automatically increments (e.g., from `v1` to `v2`). The old PDF is retained in storage for archival purposes.

### Publishing a Catalog

Publishing makes the catalog visible to the public and triggers email notifications to all opted-in members.

1. Open the catalog editor.
2. Verify the PDF has been uploaded and the cover image is set.
3. Click **Publish Catalog**.
4. Confirm in the dialog.

**What happens:**
- `status` changes to `published`, `published_at` is set to the current timestamp.
- All users with `notify_artwork_updates = true` receive an in-app notification.
- An email batch is sent via the `send-email` Edge Function with the `catalog-published` template.
- An audit log entry is created.

> **Warning:** Publishing is reversible (you can set the catalog back to `draft` or `archived`), but notification emails **cannot be recalled**. Verify the PDF is correct before publishing.

### Archiving a Catalog

To archive a catalog (hide it from the public listing but keep the download link working for those who have it):

1. Open the catalog editor.
2. Change the **Status** to `archived`.
3. Click **Save**.

Archived catalogs are not shown on the `/catalogs` public page but the `/api/catalogs/download` route returns 404 for archived catalogs. To keep downloads working for archived catalogs, use `published` status and simply remove it from featured lists.

---

## Gallery Media Management

1. Navigate to **Admin → Gallery** (`/admin/gallery`).
2. Select the **Exhibition** from the dropdown.
3. Click **Upload Media**.
4. Choose one or more image or video files.
5. For each file, set:
   - **Category**: `opening-night`, `artwork`, `behind-the-scenes`, `award-ceremony`
   - **Caption (English)** and **Caption (Bengali)** (optional)
   - **Sort Order**: Lower numbers appear first. Drag-and-drop reordering is also available.
6. Click **Upload**.

To delete a media item:
- Click the **⋮** menu on the media card → **Delete**.
- Confirm the deletion. The file is removed from Supabase Storage and the database record is deleted.

---

## User Management

### Viewing All Users

Navigate to **Admin → Users** (`/admin/users`).

The user list shows: name, email, role, join date, artwork count, and last login (if available). Use the search bar and role filter to find specific users.

### Changing a User's Role

Only `admin` role users can change roles.

1. Find the user in the user list and click **Edit**.
2. Change the **Role** dropdown to the desired role (`member`, `committee`, `admin`).
3. Click **Save**.

**What happens:**
- The user's `role` column in `profiles` is updated.
- An audit log entry is created with the old and new role in the `details` JSON.
- The change takes effect on the user's **next page load** (Supabase JWT refresh).

> **Caution:** Granting `admin` role gives the user full access to all admin features, including changing other users' roles and viewing audit logs. Only grant this to trusted team members.

### Deactivating a User

The platform does not have a "soft deactivate" feature. To prevent a user from accessing the system:

1. In the Supabase Dashboard, navigate to **Authentication → Users**.
2. Find the user by email.
3. Click **⋮** → **Ban user**.

A banned user cannot log in. Their data (artworks, profile) is retained. To reinstate them, click **Unban user** in the same menu.

---

## Notifications

### Sending a Broadcast Notification

To send an in-app notification to all members (e.g., announcing a new exhibition):

1. Navigate to **Admin → Notifications** (`/admin/notifications`).
2. Click **New Broadcast**.
3. Fill in:
   - **Message (English)**: The notification text in English.
   - **Message (Bengali)**: The notification text in Bengali.
   - **Type**: `general`
4. Select recipients:
   - **All members** — sends to every user with `notify_in_app = true`.
   - **Participants in exhibition [year]** — sends only to artists in that exhibition.
5. Optionally check **Also send email** to trigger email notifications for users with `notify_email = true`.
6. Click **Send Notification**.

---

## Audit Logs

The audit log is an append-only record of all admin and committee actions. Only `admin` role users can view it.

Navigate to **Admin → Audit Logs** (`/admin/audit-logs`).

### Filtering Logs

| Filter | Options |
|---|---|
| **Date range** | Select start and end dates |
| **Actor** | Filter by admin/committee member name |
| **Action** | `artwork.approved`, `artwork.rejected`, `catalog.published`, `user.role_changed`, etc. |
| **Entity type** | `artwork`, `catalog`, `exhibition`, `profile` |

### Log Entry Structure

Each log entry contains:

| Field | Description |
|---|---|
| **Actor** | The name and email of the admin/committee member who performed the action |
| **Action** | The action performed (e.g., `artwork.approved`) |
| **Entity** | The type and ID of the affected record, with a link to it |
| **Details** | Additional context (e.g., rejection reason, old/new role) |
| **Timestamp** | Exact date and time in Bangladesh Standard Time (BST, UTC+6) |

> Audit log entries cannot be deleted or edited, even by admins. This is enforced at the database level via RLS policy.

---

## Committee Member Configuration

The committee page on the public site displays committee members and their roles for a given year.

1. Navigate to **Admin → Committee** (`/admin/committee`).
2. Select the **Year**.
3. Click **Add Member**.
4. Select the **User** (must have an existing profile).
5. Fill in:
   - **Title (English)**: e.g., "Exhibition Secretary"
   - **Title (Bengali)**: e.g., "প্রদর্শনী সচিব"
   - **Sort Order**: Order of display on the committee page (lower = appears first).
6. Click **Save**.

To remove a committee member from a year's listing: click **Remove** next to their entry. This does not affect their user account or role.
