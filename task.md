# Milestone 7: Admin Dashboard & Exhibition Management

## 1. Core Architecture
- `[x]` Scaffold `src/app/[locale]/(admin)` route group
- `[x]` Create `layout.tsx` enforcing `admin` role strictly
- `[x]` Create `AdminSidebar` and navigation UI

## 2. Admin Dashboard (`/admin`)
- `[x]` Fetch & display overview metrics (Pending artworks, Active exhibitions, Total artists, etc.)
- `[x]` Create Read-Only Audit Log widget

## 3. Exhibition Management (`/admin/exhibitions`)
- `[x]` List all exhibitions with status badges
- `[x]` Create/Edit Exhibition forms (Dates, Banner, Venue)
- `[x]` Duplicate Exhibition logic

## 4. Artwork Moderation (`/admin/artworks`)
- `[x]` Data table for pending artworks
- `[x]` Moderation Review Dialog (Zoomable image, artist info, notes)
- `[x]` Approve/Reject/Request Changes Server Actions

## 5. Committee Management (`/admin/committee`)
- `[x]` List members with Drag-and-Drop ordering
- `[x]` Form for Add/Edit member (Photo, bio, role, year)

## 6. CMS Management (`/admin/cms`)
- `[x]` Visual Editor for Homepage, About, Contact
- `[x]` JSON Validation
- `[x]` Draft/Publish/Preview mode logic (Requires Schema adjustment or handling)

## 7. Gallery Management (`/admin/gallery`)
- `[x]` Bulk upload interface for images/videos
- `[x]` Category assignments & Reordering

## 8. User Management (`/admin/users`)
- `[x]` Searchable list of members
- `[x]` View profile, stats, exhibition history
- `[x]` Edit roles / Disable accounts

## 9. Verification
- `[/]` TypeScript & ESLint pass
- `[/]` Build succeeds
- `[/]` Role permissions verified
