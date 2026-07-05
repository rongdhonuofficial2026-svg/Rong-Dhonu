# Milestone 4: Design System & Core UI Implementation Plan

## Goal
Build a comprehensive, reusable, accessible, and type-safe Design System based on the "Premium Museum Aesthetic" defined in the Project Bible.

## User Review Required
> [!IMPORTANT]  
> **Component Library Architecture:** To achieve WCAG accessibility, type-safety, and production-readiness for 30+ complex components (Dialogs, Drawers, Selects, etc.) without reinventing the wheel and risking accessibility bugs, I propose using **shadcn/ui** (powered by Radix UI primitives and Tailwind CSS). 
> 
> *Why shadcn/ui?* It is not a traditional dependency; it copies the source code directly into our project (`src/components/ui/*`), allowing us to fully customize the HTML/Tailwind to match the **Premium Museum Aesthetic** (warm creams, deep charcoals, gold accents, playfair display fonts, and glassmorphism).
> 
> Please confirm if you approve the use of `shadcn/ui` as the foundation for the primitive components.

## Proposed Changes

### 1. Foundation & Configuration
- **Tailwind Config**: Extend the theme with `colors` (cream, charcoal, gold, indigo), `boxShadow` (soft museum lighting), `fontFamily` (Playfair, Inter, Noto), and `animation` (subtle fade/zoom).
- **Utils**: Setup `cn` utility (`clsx` + `tailwind-merge`) for clean dynamic class merging.

### 2. Primitive Components (via Shadcn/ui & Customization)
I will generate and then heavily customize the following primitives to match the museum aesthetic (glassmorphism, generous padding, soft borders):
- **Buttons**: Primary (Charcoal/Gold), Secondary (Glass/Outline), Ghost, Icon.
- **Forms**: Input, Textarea, Select, Checkbox, RadioGroup, Label, Form Wrapper.
- **Feedback**: Toast (Sonner), Alert, Badge, Skeleton (loading), Empty State, Error Boundary.
- **Layout/Navigation**: Card, Dialog, Drawer, Tabs, Table, Pagination, Breadcrumb.

### 3. Custom Domain Components
These will be built from scratch using the primitives:
- **`ArtworkCard`**: Image optimization, hover-zoom animation, glassmorphism overlay for artist name.
- **`ArtistCard`**: Avatar, bio snippet, subtle shadow.
- **`GalleryCard`**: Masonry grid item layout.
- **`Timeline`**: Vertical/Horizontal exhibition lifecycle timeline.
- **`PageLoader`**: Elegant full-screen museum-style loading state.
- **`SearchOverlay`**: Full-screen glassmorphism search modal with FTS integration UI.
- **`MultiStepForm`**: Animated form wizard layout for artwork submissions.

### 4. Layout Refinement
- **Navbar**: Enhance existing Navbar with mobile responsiveness (Hamburger menu -> Drawer) and glassmorphism.
- **Footer**: Enhance existing Footer.
- **Responsive Grid**: Standardize a `<Grid>` component for consistent masonry/columns.

## Verification Plan
### Automated Tests
- Run `npm run build` and `npx tsc --noEmit` to verify type-safety of all generated and custom components.
- ESLint verification.

### Manual Verification
- Create a temporary `/design-system` route that showcases all components (like a mini-Storybook) so you can visually verify the Museum Aesthetic, typography, and dark/light theme support.
