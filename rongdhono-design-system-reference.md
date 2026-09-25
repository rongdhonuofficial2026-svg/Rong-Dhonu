# Rongdhono — Design System Reference
**For: Homepage & About Page (dark gallery theme)**
**Purpose: implementation reference for developers or AI coding assistants**

---

## 1. Brand direction

A dark, premium "art gallery after dark" aesthetic for a Bengali artists' collective (Rongdhono, Berhampore, West Bengal). Near-black canvas throughout, with real photography supplying color rather than decorative gradients, one warm gold accent, and a small set of jewel-tone accents used sparingly. Typography pairs a characterful serif (Fraunces) for display with a clean grotesque (Inter) for everything functional.

---

## 2. Fonts

**Google Fonts import (place in `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

| Token | Value | Used for |
|---|---|---|
| `--font-display` | `'Fraunces', Georgia, serif` | All headings (`h1`–`h4`), pull-quotes, stat numbers, wall labels |
| `--font-body` | `'Inter', -apple-system, sans-serif` | Body copy, nav, buttons, eyebrows, badges, meta text |

**Rule of thumb:** if it's a heading or an emphasized/italic accent word → Fraunces. Everything else → Inter. Never mix them within one text element except the deliberate `<em>` italic accent inside H1s.

---

## 3. Color tokens (CSS custom properties)

```css
:root{
  /* neutrals */
  --void:#0B0908;              /* page background, deepest black */
  --ink:#151210;                /* card/section backgrounds, buttons */
  --ink-800:#1E1A16;
  --ink-700:#2B2521;
  --parchment:#F4EEDF;          /* primary text on dark, solid */
  --parchment-dim:rgba(244,238,223,.72);   /* secondary text on dark */
  --parchment-faint:rgba(244,238,223,.46); /* tertiary/caption text on dark */
  --hairline:rgba(244,238,223,.14);        /* borders on dark surfaces */

  /* accents — each has deep/mid/bright for gradients & glows */
  --crimson-deep:#6E1524;  --crimson:#B4233A;  --crimson-bright:#E9445E;
  --gold-deep:#8A6015;     --gold:#D9A233;      --gold-bright:#F4C662;   /* THE primary accent */
  --emerald-deep:#0A4136;  --emerald:#157A5E;   --emerald-bright:#33CB9C;
  --indigo-deep:#141C3E;   --indigo:#293A72;    --indigo-bright:#5F7BE8;
  --magenta-deep:#450F38;  --magenta:#7E1F63;   --magenta-bright:#D34AA8;

  /* light "paper" surfaces — used for occasional contrast sections (e.g. About page mission/vision) */
  --paper:#EFE6D2;
  --paper-line:#DCCFAE;
  --ink-on-paper:#1E1A16;
  --ink-on-paper-dim:#5C5347;

  /* layout tokens */
  --container:1320px;
  --edge:6vw;                   /* horizontal page padding */
  --radius-sm:8px; --radius-md:16px; --radius-lg:26px;
  --ease:cubic-bezier(.19,1,.22,1);
}
```

**Usage rule:** `--gold-bright` (`#F4C662`) is the *only* accent color used for text/UI (badges, links, rules, icons). Crimson/emerald/indigo/magenta are reserved for the generative "artwork" gradient system (section 6) and testimonial card glows — never for UI text or buttons.

---

## 4. Typography scale

| Element | Font | Weight | Size | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|
| Homepage H1 | Fraunces | 600 | `clamp(56px,8vw,132px)` | .94 | -.03em | `#F4EEDF` + `text-shadow:0 6px 40px rgba(0,0,0,.35)` |
| Homepage H1 `<em>` accent | Fraunces | 400, italic | inherited | inherited | inherited | `#F4C662` |
| About page H1 | Fraunces | 600 | `clamp(46px,6vw,84px)` | 1.02 | -.02em | `#F4EEDF` (no text-shadow) |
| Section H2 | Fraunces | 600 | `clamp(30px,3.4–4.4vw,50–64px)` (varies by section) | 1.06–1.2 | -.01em | `#F4EEDF` |
| Body paragraph | Inter | 400 | 15–17px | 1.65–1.75 | normal | `--parchment-dim` |
| Eyebrow label | Inter | 700 | 11.5–12px | normal | **.2em** (very wide) | `--gold-bright` (or `--crimson` with `.on-paper` modifier) |
| Button label | Inter | 600 | 13–14.5px | normal | .01em | varies by button (see §5) |
| Stat number | Fraunces | 600 | 28–40px | normal | normal | `#F4EEDF` |
| Stat caption | Inter | normal | 11.5–13px | normal | .06–.1em, uppercase | `--parchment-faint` |
| Nav link | Inter | 500 | 13.5–14px | normal | normal | `--parchment-dim`, hovers to full `--parchment` with an underline wipe |

**Eyebrow component pattern** (small caps label used above most section headings):
```css
.eyebrow{
  font-family: var(--font-body);
  font-size: 11.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  color: var(--gold-bright);
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 22px;
}
.eyebrow::before{ content:""; width:26px; height:1px; background: var(--gold-bright); display:inline-block; }
.eyebrow.on-paper{ color: var(--crimson); }
.eyebrow.on-paper::before{ background: var(--crimson); }
.eyebrow.center{ justify-content: center; }
```

---

## 5. Buttons

```css
.btn{
  display:inline-flex; align-items:center; gap:10px; justify-content:center;
  padding:16px 32px; border-radius:999px; font-weight:600; font-size:14.5px; letter-spacing:.01em;
  transition:transform .2s var(--ease), box-shadow .35s var(--ease), background .3s ease, color .3s ease;
}
.btn-gold{ background: var(--gold-bright); color: var(--void); }
.btn-gold:hover{ box-shadow: 0 18px 34px -12px rgba(244,198,98,.45); }

.btn-line{ border:1px solid var(--hairline); color: var(--parchment); }
.btn-line:hover{ background: var(--parchment); color: var(--void); border-color: var(--parchment); }

.btn-ink{ background: var(--ink); color: var(--parchment); border:1px solid var(--hairline); }
.btn-ink:hover{ background: var(--parchment); color: var(--void); }

.btn-paper{ background: var(--ink-on-paper); color: var(--paper); }  /* used on light "paper" sections */
.btn-paper:hover{ background: var(--crimson); color: var(--paper); }

.btn-sm{ padding:12px 24px; font-size:13px; }
```
All buttons are fully rounded (`border-radius:999px`), never square. `.btn-gold` is the primary CTA style site-wide.

---

## 6. Photography / "artwork" treatment

Every image on the site (hero backgrounds, artist cards, collection tiles) uses a consistent treatment so unrelated stock/source photos read as one curated set:

```css
.artwork{ position:relative; overflow:hidden; isolation:isolate; background: var(--ink-800); }
.artwork img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  filter: saturate(1.22) contrast(1.08) brightness(.94);   /* pushes color, unifies disparate source photos */
  transform: scale(1.02);
  transition: transform 1s var(--ease), filter .6s ease;
}
.artwork:hover img{ transform: scale(1.1); }               /* slow zoom on hover */

/* scrim = dark gradient overlay for text legibility over photos, two variants: */
.artwork .scrim{
  position:absolute; inset:0; z-index:1;
  background: linear-gradient(195deg, transparent 38%, rgba(5,4,3,.82) 100%);
}
.artwork .scrim.soft{   /* used specifically on the homepage hero */
  background: linear-gradient(200deg, rgba(5,4,3,.15) 0%, rgba(5,4,3,.15) 45%, rgba(5,4,3,.85) 100%);
}

/* frame-edge = subtle inset border, makes images read as "mounted/framed" rather than flat */
.artwork .frame-edge{
  position:absolute; inset:0; z-index:1; pointer-events:none;
  box-shadow: inset 0 0 0 1px rgba(244,238,223,.14), inset 0 0 60px rgba(0,0,0,.35);
}
```

**Global film grain** (fixed overlay across the whole viewport, applied once at body level):
```css
.grain{ position:fixed; inset:0; z-index:9998; pointer-events:none; mix-blend-mode:overlay; opacity:.5; }
```
```html
<svg class="grain">
  <filter id="grainFilter">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grainFilter)"/>
</svg>
```

---

## 7. Hero sections — full detail

### 7a. Homepage hero
- Full-bleed `.artwork` photo background, `.scrim.soft` overlay (see §6)
- Content is **left-aligned, bottom-anchored** (`.hero{ display:flex; align-items:flex-end; min-height:100vh; }`)
- Status pill above H1: `12px / 600 / letter-spacing .02em`, color `#F4EEDF`, background `rgba(11,9,8,.35)` + `backdrop-filter: blur(8px)`, `border:1px solid var(--hairline)`, `border-radius:999px`, small pulsing gold dot (7×7px, `box-shadow:0 0 0 4px rgba(244,198,98,.2)`, opacity animates 1→.35→1 over 2.4s)
- H1: `clamp(56px,8vw,132px)`, weight 600, line-height `.94`, letter-spacing `-.03em`, color `#F4EEDF`, `text-shadow:0 6px 40px rgba(0,0,0,.35)`
- H1 italic accent word: weight 400 italic, color `#F4C662`
- Subtitle: `17px` Inter, `rgba(244,238,223,.72)`, `max-width:400px`, `line-height:1.7`
- Below subtitle: two buttons (`.btn-gold` + `.btn-line`) + a 3-column inline stat row (Fraunces 28px numbers / Inter 11.5px uppercase captions), all sitting on top of a hairline top-border divider

### 7b. About page hero
- Full-bleed `.artwork` photo background, plain `.scrim` (not `.soft` — see §6 for the different gradient stops)
- Content is **centered**, `max-width:760px`, `text-align:center`
- Eyebrow above H1 uses `.eyebrow.center` (see §4) — NOT the status-pill pattern used on the homepage
- H1: `clamp(46px,6vw,84px)`, weight 600 (inherited, not re-declared), line-height `1.02`, letter-spacing `-.02em`, color `#F4EEDF`, **no text-shadow**
- Gold rule under H1: `64px × 2px`, `background:#F4C662`, centered (`margin:0 auto 26px`)
- Subtitle: `17px` Inter, `rgba(244,238,223,.72)`, `max-width:480px`, centered, `line-height:1.7`

### 7c. Side-by-side differences
| | Homepage | About |
|---|---|---|
| H1 max size | 132px | 84px |
| H1 text-shadow | yes | no |
| Alignment | left, bottom-anchored | centered |
| Scrim | 3-stop (`.scrim.soft`) | 2-stop (`.scrim`) |
| Accent above H1 | status pill w/ pulsing dot | eyebrow + gold rule |
| Color pop in heading | yes (italic gold word) | no |

---

## 8. Interaction / motion patterns

These are behavioral, not just visual — include if the target implementation should feel identical.

**Custom cursor** — a 26px gold-outlined ring (`mix-blend-mode:difference`) follows the pointer; grows to 52px with a soft gold fill when hovering any `a`, `button`, or `.magnetic` element. Disabled on touch devices (`(hover:none)` media query).

**Magnetic buttons** (`.magnetic` class) — on mousemove within the button's bounding box, the button translates up to ~25% of the cursor's offset from center, snapping back to `translate(0,0)` on mouseleave. Applied to primary CTAs and nav "Register" button.

**Hero parallax** — the hero photo background shifts a few pixels opposite the cursor position on mousemove (homepage: direct `transform: translate() scale(1.05)`; About page: CSS custom properties `--px`/`--py` consumed by the `.page-hero img` transform, `scale(1.08)`), for a subtle depth effect.

**Scroll-reveal** — any element with class `.reveal` starts at `opacity:0; transform:translateY(28–30px)`, animates to `opacity:1; transform:translateY(0)` over `.8–.9s` via `IntersectionObserver` (threshold `0.12`), once, then unobserves.

**Nav behavior differs per page:**
- Homepage: nav starts transparent over the hero image, gains a solid blurred background (`rgba(11,9,8,.78)`, `backdrop-filter:blur(16px)`) once `window.scrollY > 12`.
- About / inner pages: nav is **permanently** in the solid/blurred state (no scroll-triggered transition), since there's no transparent-hero moment to protect.

---

## 9. Implementation notes for an AI/dev picking this up

1. Load both Google Fonts weights listed in §2 — missing weights (e.g. Fraunces italic 400) will cause the H1 accent word to fall back to a synthetic/faux italic, which looks visibly worse.
2. Always resolve colors through the CSS variables in §3, not hardcoded hex — several colors (`--parchment-dim`, `--parchment-faint`) are *the same base color at different opacities*, not distinct colors; treat them as such if porting to a token system that doesn't support alpha-in-variable (e.g. Tailwind config, React Native).
3. The `.artwork` / `.scrim` / `.frame-edge` / grain system (§6) is what makes disparate stock photography read as one cohesive art collection — don't skip the `saturate(1.22) contrast(1.08) brightness(.94)` filter or the grain overlay; without them, images look like generic stock photos rather than "gallery pieces."
4. `--gold-bright` is intentionally the *only* UI accent color in regular use — resist the temptation to use crimson/emerald/indigo/magenta for text or buttons; they're reserved for imagery/glows only.
