# Rongdhono Art Gallery — Hero Section Typography Specification

**Purpose of this document:** This is a precise implementation reference for the hero (top banner) sections of the Rongdhono website. It is written so that a developer or an AI coding assistant can reproduce the hero typography, color, and layout **pixel-for-pixel** without seeing the original HTML. It covers the Exhibitions, Catalogs, Gallery, and Contact pages, plus the shared design tokens they all depend on.

---

## 1. Fonts Used

Two typefaces, loaded from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

| Role | Font | Used for |
|---|---|---|
| Display / headings | **Fraunces** (serif, variable, has an italic + optical-size axis) | `h1`–`h4`, big stat numbers, italic accent words |
| Body / UI | **Inter** (sans-serif) | paragraphs, eyebrow labels, nav, buttons, captions |

Define them as CSS custom properties once, globally:

```css
:root{
  --font-display:'Fraunces', Georgia, serif;
  --font-body:'Inter', -apple-system, sans-serif;
}
```

**Rule of thumb:** if you see body copy or a small uppercase label → Inter. If you see a large headline, an italic accent word, or a big number statistic → Fraunces.

### Next.js implementation (recommended over a raw `<link>` tag)

```js
import { Fraunces, Inter } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','900'],
  style: ['normal','italic'],
  variable: '--font-fraunces',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400','500','600','700','800'],
  variable: '--font-inter',
});

// apply fraunces.variable + inter.variable className to <html> or <body>,
// then in globals.css:
// --font-display: var(--font-fraunces), Georgia, serif;
// --font-body: var(--font-inter), -apple-system, sans-serif;
```

---

## 2. Color Tokens (used throughout hero text)

```css
:root{
  --void:#0B0908;                              /* page background */
  --parchment:#F4EEDF;                         /* solid off-white — main heading/body text */
  --parchment-dim: rgba(244,238,223,.72);      /* dimmed white — sub-paragraphs */
  --parchment-faint: rgba(244,238,223,.46);    /* faintest white — captions, meta labels */
  --hairline: rgba(244,238,223,.14);           /* thin borders/dividers on dark bg */

  --gold-bright:#F4C662;                       /* accent color — eyebrows, italic accent words */
  --gold:#D9A233;
  --gold-deep:#8A6015;

  --crimson-bright:#E9445E;
  --crimson:#B4233A;
  --crimson-deep:#6E1524;
}
```

### ⚠️ Important rule about "opacity"

None of the dimmed text above uses the CSS `opacity` property. Dimming is baked directly into the color as an **alpha channel** on an rgba value:

- `--parchment` = fully solid, 100% alpha
- `--parchment-dim` = same RGB, **72%** alpha → `rgba(244,238,223,.72)`
- `--parchment-faint` = same RGB, **46%** alpha → `rgba(244,238,223,.46)`

**Do not** apply `opacity: 0.72` to a text element to "dim" it — that also fades any background, icon, or shadow attached to that element. Always pick the correct rgba color token instead.

---

## 3. Global Base Rules (inherited by every hero)

```css
body{
  font-family: var(--font-body);
  background: var(--void);
  color: var(--parchment-dim);
  line-height: 1.5;
}
h1, h2, h3, h4{
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--parchment);
}
```

---

## 4. Exhibitions / Catalogs / Gallery — Shared `.page-hero` Pattern

These three pages use an **identical** hero component (`.page-hero`). Only the background photo, eyebrow text, headline copy, and (on two of the three) a stats row differ.

### 4.1 Structure

```html
<header class="page-hero artwork">
  <img src="HERO_IMAGE_URL" alt="..." loading="eager">
  <div class="scrim"></div>
  <div class="frame-edge"></div>
  <div class="page-hero-inner">
    <div class="reveal">
      <div class="eyebrow center">SMALL LABEL</div>
      <h1>Plain Words <em>Gold Italic Words</em></h1>
      <p class="page-hero-sub">Supporting sentence…</p>
    </div>
    <!-- meta stats row is OPTIONAL — Gallery page omits it -->
    <div class="page-hero-meta reveal">
      <div><b>14+</b><span>Exhibitions</span></div>
      <div><b>1</b><span>Upcoming</span></div>
      <div><b>2012</b><span>Founding Year</span></div>
    </div>
  </div>
</header>
```

### 4.2 Layout & scrim (container-level styling)

```css
.page-hero{
  position: relative;
  min-height: 64vh;
  display: flex;
  align-items: flex-end;      /* content sits at the bottom of the hero */
  padding: 0 var(--edge);     /* --edge: 6vw */
  color: var(--parchment);
}

/* the photo itself */
.page-hero img{
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  filter: saturate(1.22) contrast(1.08) brightness(.94);
}

/* dark gradient laid OVER the photo so text stays legible regardless of image */
.page-hero .scrim{
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg,
    rgba(5,4,3,.55) 0%,
    rgba(5,4,3,.55) 35%,
    rgba(5,4,3,.94) 100%
  );
}

.page-hero-inner{
  position: relative; z-index: 2;
  max-width: var(--container);   /* 1320px */
  margin: 0 auto;
  width: 100%;
  padding: 200px 0 76px;
  text-align: center;
}
```

**Key visual insight:** the "fade" you see behind the hero text is not an opacity/blur effect applied to the text — it's a solid dark gradient (`.scrim`) placed as its own layer between the photo and the text, going from ~55% black at the top to ~94% black at the bottom. This is what lets white text stay readable on any photo.

### 4.3 Eyebrow (small label above the headline)

```css
.eyebrow{
  font-family: var(--font-body);         /* Inter */
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--gold-bright);             /* solid #F4C662, no transparency */
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 22px;
}
.eyebrow::before{
  content:""; width:26px; height:1px;
  background: var(--gold-bright);
  display:inline-block;
}
.page-hero-inner .eyebrow{ justify-content: center; } /* centers label + its rule line */
```

### 4.4 H1 headline (two-tone: plain + italic gold accent)

```css
.page-hero h1{
  font-family: var(--font-display);      /* Fraunces (inherited) */
  font-weight: 600;
  font-size: clamp(46px, 6.4vw, 96px);   /* fluid: 46px on mobile up to 96px on large screens */
  line-height: .98;
  letter-spacing: -.02em;
  max-width: 900px;
  margin: 0 auto;
  color: var(--parchment);               /* solid #F4EEDF */
}
.page-hero h1 em{
  font-style: italic;
  font-weight: 400;                       /* lighter weight than the rest of the headline */
  color: var(--gold-bright);              /* solid #F4C662 */
}
```

The `<em>` tag is used purely as a **visual accent marker**, not semantic emphasis. Split every hero headline into "plain white segment" + "`<em>`-wrapped gold italic segment," e.g.:

- Exhibitions: `Exhibitions <em>Through the Years</em>`
- Catalogs: `Exhibition <em>Catalog Archive</em>`
- Gallery: `Walk Through <em>Our Gallery</em>`

### 4.5 Sub-paragraph

```css
.page-hero-sub{
  font-family: var(--font-body);          /* Inter (inherited) */
  max-width: 620px;
  margin: 26px auto 0;
  font-size: 16.5px;
  line-height: 1.7;
  color: var(--parchment-dim);            /* rgba(244,238,223,.72) */
}
```

### 4.6 Stats/meta row (present on Exhibitions & Catalogs, absent on Gallery)

```css
.page-hero-meta{
  display: flex;
  justify-content: center;
  gap: 46px;
  margin-top: 46px;
  flex-wrap: wrap;
}
.page-hero-meta div{ display:flex; flex-direction:column; align-items:center; }
.page-hero-meta b{
  font-family: var(--font-display);       /* Fraunces */
  font-size: 30px;
  font-weight: 600;
  color: var(--parchment);                /* solid */
}
.page-hero-meta span{
  font-family: var(--font-body);          /* Inter */
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--parchment-faint);          /* rgba(244,238,223,.46) — faintest tier */
  margin-top: 4px;
}
```

### 4.7 Copy used on each page (for reference)

| Page | Eyebrow | Headline | Sub-copy | Stats row? |
|---|---|---|---|---|
| Exhibitions | Museum Chronology | Exhibitions *Through the Years* | Explore the legacy of our annual fine art exhibitions — a decade and a half of showcasing generations of Bengal's most distinctive artistic voices. | Yes — 14+ Exhibitions / 1 Upcoming / 2012 Founding Year |
| Catalogs | Digital Archive | Exhibition *Catalog Archive* | Browse every official Rongdhono exhibition catalog. Discover each exhibition through beautifully curated digital publications that preserve our artistic journey. | Yes — 1 Publications / 3.7 MB Archive Size / EN Language |
| Gallery | Visual Archive | Walk Through *Our Gallery* | A curated visual journey through our exhibitions, ceremonies, and behind the scenes — every album a room in the museum. | No |

---

## 5. Contact Page — Its Own Hero Variant

Contact intentionally uses a **different, shorter, left-aligned** hero (`.contact-hero` / `.contact-inner`), not `.page-hero`.

### 5.1 Structure

```html
<header class="contact-hero artwork">
  <img src="HERO_IMAGE_URL" alt="Guests conversing warmly during a gallery reception" loading="eager">
  <div class="scrim"></div>
  <div class="frame-edge"></div>
  <div class="contact-inner">
    <div class="eyebrow reveal">Visit &amp; Connect</div>
    <h1 class="reveal">Get in <em>Touch</em></h1>
    <p class="reveal">We would love to hear from you. Visit us at the Silver Thread Art Gallery, or send a note below — our curatorial team replies personally to every inquiry.</p>
  </div>
</header>
```

### 5.2 Layout & scrim

```css
.contact-hero{
  position: relative;
  min-height: 52vh;                       /* shorter than the 64vh page-hero */
  display: flex;
  align-items: flex-end;
  padding: 0 var(--edge);
  color: var(--parchment);
}
.contact-hero .scrim{
  background: linear-gradient(180deg,
    rgba(5,4,3,.5) 0%,
    rgba(5,4,3,.55) 40%,
    rgba(5,4,3,.95) 100%
  );
}
.contact-inner{
  max-width: var(--container);
  margin: 0 auto;
  padding: 200px 0 90px;
  position: relative;
  z-index: 2;
  /* NOTE: no text-align:center here — this block is LEFT-aligned,
     unlike the centered .page-hero-inner used on the other 3 pages */
}
```

### 5.3 Eyebrow

Same `.eyebrow` rule as section 4.3 (shared globally), just not wrapped in `.center` this time, so it stays left-aligned:

```css
.eyebrow{
  font-family: var(--font-body); font-size:11.5px; font-weight:700;
  letter-spacing:.2em; text-transform:uppercase; color: var(--gold-bright);
}
```

### 5.4 H1

```css
.contact-inner h1{
  font-family: var(--font-display);       /* Fraunces */
  font-weight: 600;
  font-size: clamp(46px, 6vw, 86px);      /* smaller ceiling than page-hero's 96px */
  color: var(--parchment);
  letter-spacing: -.02em;
  line-height: 1;
}
.contact-inner h1 em{
  font-style: italic;
  font-weight: 400;
  color: var(--gold-bright);
}
```

### 5.5 Paragraph

```css
.contact-inner p{
  font-family: var(--font-body);          /* Inter */
  margin-top: 22px;
  font-size: 17px;                        /* slightly larger than page-hero-sub's 16.5px */
  color: var(--parchment-dim);            /* rgba(244,238,223,.72) */
  max-width: 520px;
  line-height: 1.7;
}
```

---

## 6. Quick-Reference Table (all hero text elements, all 4 pages)

| Element | Font Family | Weight | Style | Size | Color (exact value) | Alignment |
|---|---|---|---|---|---|---|
| Eyebrow label | Inter | 700 | uppercase, letter-spacing .2em | 11.5px | `#F4C662` (solid) | center (page-hero) / left (contact) |
| H1 — plain segment | Fraunces | 600 | normal | clamp(46px,6.4vw,96px) page-hero · clamp(46px,6vw,86px) contact | `#F4EEDF` (solid) | center / left |
| H1 — `<em>` accent segment | Fraunces | 400 | italic | same as parent h1 | `#F4C662` (solid) | inline with h1 |
| Sub-paragraph | Inter | 400 | normal | 16.5px (page-hero) · 17px (contact) | `rgba(244,238,223,.72)` | center / left |
| Stat number (`b`) | Fraunces | 600 | normal | 30px | `#F4EEDF` (solid) | center |
| Stat label (`span`) | Inter | 400 | uppercase, letter-spacing .08em | 11px | `rgba(244,238,223,.46)` | center |

---

## 7. Implementation Checklist

1. Load Fraunces (normal + italic styles, weights 300–900) and Inter (weights 400–800) — via Google Fonts `<link>` or `next/font/google`.
2. Set the two `--font-display` / `--font-body` CSS variables at the root.
3. Set the three text-color tiers (`--parchment`, `--parchment-dim`, `--parchment-faint`) as rgba values with baked-in alpha — never use the `opacity` CSS property to dim hero text.
4. Build the hero as three stacked layers: `<img>` (cover-fit photo) → `.scrim` (dark gradient overlay) → text content, all inside a `position: relative` container with the text layer at `z-index: 2`.
5. Use `clamp()` for all hero headline font sizes so they scale fluidly between mobile and desktop instead of jumping at breakpoints.
6. Wrap the accent portion of every headline in `<em>` and style it italic + gold — this is a deliberate two-tone visual pattern repeated across every hero on the site, not semantic HTML emphasis.
7. Exhibitions and Catalogs pages include an optional stats row (`.page-hero-meta`) below the sub-paragraph; Gallery and Contact do not.
8. Contact's hero is shorter (52vh vs 64vh), left-aligned (vs centered), and uses a smaller max headline size (86px vs 96px ceiling) — treat it as a distinct component, not a reuse of `.page-hero`.

