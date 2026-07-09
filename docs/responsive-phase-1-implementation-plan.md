# Responsive Optimization Phase 1 — Implementation Plan

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| **1A** | Public-site responsive audit (no code changes) | ✅ Complete |
| **1B** | Surgical mobile/tablet implementation | ✅ Complete |

**Constraint:** Desktop (≥1025px) is locked. All fixes use `max-width` media queries, `(pointer: coarse)`, or `orientation` rules only.

---

## Phase 1A Audit Summary (Baseline)

### Highest Risks (from audit)

| Priority | Area | Issue |
|----------|------|-------|
| P0 | Navigation | `MobileNavigation` nested inside `.nav-actions`, which is hidden below 760px |
| P1 | Toolbars/Filters | Catalog/gallery filter bars compress at 320–430px |
| P1 | Touch Targets | Footer social (~38px), PDF modal controls (~32px) below 44px |
| P1 | Two-Column Cards | About/home artist rows stay 2-col below 760px |
| P2 | Touch Animation | Hero/parallax/reveal patterns too desktop-heavy on touch |

---

## Phase 1B — Extended Implementation Scope

### 1. Shared Responsive Components

| Component | Actions |
|-----------|---------|
| **Header** | Safe-area padding; compact brand on phones |
| **Mobile Navigation** | Move trigger to `.nav-burger`; tablet burger ≤1024px; 44px trigger; sheet safe-area |
| **Footer** | 44px social buttons; newsletter input/button touch sizing; single-col grid ≤760px |
| **Hero Sections** | See §2 — all public heroes |
| **Buttons** | `min-height: 44px` on mobile for `.btn`, `.btn-sm`, filter pills, cat tabs |
| **Cards** | Artist/committee rows → 1 col ≤480px; catalog/gallery grids verified |
| **Search** | `SearchOverlay` full-width dialog on phones |
| **Filters** | Toolbar stack + 2-col pill grid ≤760px; full-width pills ≤430px |
| **Tabs** | `.cat-tab` touch height on mobile |
| **Forms** | 16px inputs (iOS zoom guard); inquiry chips 44px; field spacing |
| **Inputs** | Contact, newsletter, auth — comfortable padding |
| **Dialogs/Modals** | Search, PDF preview — responsive sizing, 44px controls |
| **Pagination** | Touch-friendly hit areas where used on public pages |
| **Empty/Loading States** | No overflow; readable padding on narrow screens |

**Files:** `Navbar.tsx`, `MobileNavigation.tsx`, `SearchOverlay.tsx`, `CatalogPreviewModal.tsx`, `globals.css`, `home.css`, `responsive-public.css`

---

### 2. Hero Sections (Every Public Hero)

Verify on all pages:

- Typography scaling (`clamp` / mobile overrides)
- Text hierarchy and CTA layout
- Background `object-fit` / `object-position`
- Responsive padding and height (no 80vh domination on phones)
- Vertical alignment, no clipping or awkward wrapping

| Page | Hero selector / location |
|------|--------------------------|
| Home | `.hero`, `.hero-content` — `home.css` |
| About | `.about-page-hero`, `.page-hero` — `globals.css` |
| Exhibitions | `.exhibitions-page-hero`, `.page-hero` |
| Exhibition Details | Tailwind hero section — `exhibitions/[id]/page.tsx` |
| Gallery | `.gallery-page-hero` |
| Artwork Details | Page header block |
| Catalogs | `.catalogs-page-hero` |
| Catalog Details | Catalog hero block |
| Artists / Profile | `pt-32` header sections |
| Contact | `.contact-hero`, `.contact-inner` |
| Search | `SearchOverlay` dialog |
| Login / Register | Auth card shell |

---

### 3. Touch Optimization

- Minimum **44×44px** touch targets on all interactive controls
- Comfortable spacing between tappable elements
- Thumb-friendly layouts (stacked CTAs, full-width buttons where needed)
- `font-size: 16px` on form inputs (mobile keyboard / iOS zoom)
- Accessible focus and aria labels preserved

---

### 4. Image Optimization

- `object-fit: cover` / `object-position: center` on hero images
- Masonry/gallery: no stretch; `width: 100%; height: auto`
- Lazy loading preserved (`loading="lazy"`)
- Mobile crops via `object-position` on detail heroes where needed
- Coarse-pointer: disable hover scale on `.page-hero img`

---

### 5. Responsive Grids

| Grid | Tablet (≤1080px) | Mobile (≤760px) | Narrow (≤480px) |
|------|------------------|-----------------|-----------------|
| Artist rows (home/about) | 2 col | 2 col → **1 col ≤480px** | 1 col |
| Catalog grid | 2 col | 1 col | 1 col |
| Gallery masonry | 2 col | 1 col | 1 col |
| Album grid | 2 col | 1 col | 1 col |
| Footer | 2 col | 1 col | 1 col |
| Artists directory | sm:2 lg:4 (Tailwind — OK) | 1 col | 1 col |

Desktop multi-column layouts unchanged at ≥1025px.

---

### 6. Navigation

- [x] P0: Decouple burger from hidden `.nav-actions`
- Tablet (≤1024px): hide inline nav links; show burger + compact actions (search)
- Mobile (≤760px): hide lang/login/register from bar; burger + search only
- Safe-area insets on fixed header
- Sheet: scroll lock (Radix), safe-area padding, 44px nav links

---

### 7. Forms

| Form | Location |
|------|----------|
| Contact | `ContactForm`, `contact.css` / `globals.css` |
| Newsletter | `FooterNewsletterForm` |
| Login | `(auth)/login/page.tsx` |
| Register | `(auth)/register/page.tsx` |
| Search | `SearchOverlay` |

Mobile: input spacing, 44px submit/toggle, error message readability.

---

### 8. Dialogs & Modals

| Modal | Fixes |
|-------|-------|
| Catalog Preview (PDF) | 44px toolbar buttons; title truncation |
| Gallery Lightbox | 44px close; visible labels on touch |
| Search Dialog | Full-width ≤640px; 48px search input |

---

### 9. Responsive Performance

- Coarse-pointer: disable heavy `.reveal` transforms, `.magnetic`, hover parallax
- `prefers-reduced-motion` already in `globals.css` — preserved
- No new layout-shift sources; images keep aspect ratios
- Lazy loading unchanged

---

### 10. Landscape Support

Rules for `orientation: landscape` + `max-height: 500px`:

- Reduce hero min-heights and top padding
- Prevent vertical crowding on phone landscape

---

## Page-by-Page Checklist

| Page | Key fixes |
|------|-----------|
| **Home** | Hero padding/stats; bento rhythm; artist-row 1-col narrow; footer touch |
| **About** | Hero height; committee cards 1-col narrow; mission spacing |
| **Exhibitions** | Spotlight/timeline stacking (existing + polish); archive rows ≤640px |
| **Exhibition Details** | Hero 60vh/380px min on mobile; title scale; sticky card static on mobile |
| **Gallery** | Toolbar wrap; cat tabs; masonry labels on touch; lightbox |
| **Artwork Details** | Metadata spacing; action controls |
| **Catalogs** | Filter bar wrap; featured pub stack; card metadata |
| **Catalog Details** | Action button stack; PDF modal controls |
| **Artists** | Grid spacing at 320–390px |
| **Artist Profile** | Header padding; artwork grid gap |
| **Contact** | Form card padding; inquiry chips; visit tiles |
| **Search** | Dialog full-width mobile |
| **Login / Register** | 44px submit; password toggle; 16px inputs |

---

## Implementation Order

1. **P0 Navigation** — `Navbar.tsx`, `MobileNavigation.tsx`, nav CSS
2. **Shared CSS foundation** — `responsive-public.css` (touch, heroes, grids, coarse-pointer)
3. **Shared components** — Footer targets, SearchOverlay, CatalogPreviewModal
4. **Page-specific** — Exhibition detail, auth forms, home.css artist-row
5. **Verification** — `npm run lint`, `npx tsc --noEmit`, `npm run build`

---

## Verification Matrix

Breakpoints to manually verify:

**Mobile:** 320, 360, 375, 390, 412, 430, 480 px  
**Tablet:** 768, 820, 834, 1024, 1180 px  
**Portrait + landscape** on phone and tablet

Checklist:

- [ ] No horizontal scrolling
- [ ] No clipped text / overlapping elements
- [ ] Grids and images correct
- [ ] Navigation, forms, dialogs functional
- [ ] No hydration issues
- [ ] Desktop visually identical

---

## Out of Scope (unchanged)

Admin Dashboard, CMS, Member Portal, database, Supabase, API routes, auth logic, server actions, email, localization architecture, business logic.
