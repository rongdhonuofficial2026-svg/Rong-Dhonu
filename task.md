# Milestone 7: Admin Dashboard & Exhibition Management

## 1. Core Architecture
- `[x]` Scaffold `src/app/[locale]/(admin)` route group
- `[x]` Create `layout.tsx` enforcing `admin` role strictly
- `[x]` Create `AdminSidebar` and navigation UI

## 2. Admin Dashboard (`/admin`)
- `[x]` Fetch & display overview metrics (Pending artworks, Active exhibitions, Total artists, etc.)
- `[x]` Create Read-Only Audit Log widget

## 3. Exhibition Management (`/admin/exhibitions`)
- `[x]` 1. **Asset Generation & Preparation**
  - `[x]` Create `/public/images/placeholders/` directory
  - `[x]` Generate and save `hero.webp`, `exhibition.webp`, `artist.webp`, `artwork-1.webp`, `artwork-2.webp`, `artwork-3.webp` using specific artistic prompts
- `[x]` 2. **Component Architecture**
  - `[x]` Create `src/components/ui/PremiumImage.tsx` wrapping `next/image` to support skeletons, blur placeholders, and fallback logic
- `[x]` 3. **Remove Section**
  - `[x]` Remove `HomeStatistics` component from `HomeExtras.tsx` and `HomeExtrasContent.tsx`
  - `[x]` Remove `HomeStatistics` usage from `src/app/[locale]/(public)/page.tsx`
- `[x]` 4. **Hero Section Refinement**
  - `[x]` Update `HomeHeroContent.tsx` to 100vh cinematic experience
  - `[x]` Use `PremiumImage` with `/images/placeholders/hero.webp` fallback
- `[x]` 5. **Featured Exhibition Refinement**
  - `[x]` Update `HomeExhibitionContent.tsx` with elegant empty states ("Upcoming Exhibition")
  - `[x]` Use `PremiumImage` with `/images/placeholders/exhibition.webp` fallback
- `[x]` 6. **Featured Artists Refinement**
  - `[x]` Update `FeaturedArtistsContent.tsx` to use `PremiumImage` and elegant styling
- `[x]` 7. **Curated Collection Refinement**
  - `[x]` Update `FeaturedArtworksContent.tsx` with masonry-like broken layouts and glass hover states
  - `[x]` Rotate through `artwork-1.webp`, `artwork-2.webp`, `artwork-3.webp` fallbacks
- `[x]` 8. **General Polish & Transitions**
  - `[x]` Add artistic textures and gradients to separators
  - `[x]` Use `PremiumImage` in `HomeAboutContent.tsx`

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
- `[x]` 9. **Verification**
  - `[x]` Run `npm run lint` and `npm run build`
  - `[x]` Final visual audits
- `[x]` Role permissions verified
