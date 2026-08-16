# Portfolio — editorial template build

A faithful implementation of the reference template (screenshots + screen recording).
Static site: no build step, no framework, no dependencies.

```
index.html          home
research.html       ongoing research projects
assets/
  css/style.css     shared: numbered sections, tokens at the top
  css/research.css  research-page-only additions
  js/main.js        generative patterns + scroll reveals (both pages)
  img/              placeholder artwork (swap for real photos)
.claude/launch.json local preview config
```

## Preview

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>. Opening `index.html` directly with `file://` also works,
but a server is preferred so the fonts and relative asset paths behave normally.

## Design system

Everything is driven by the tokens at the top of `assets/css/style.css`:

The palette is **"Ledger"** — warm paper and oxblood, chosen over the reference
template's lavender to echo records and provenance rather than the usual blue-violet AI
palette, and because it sits in the same warm family as the photography.

| Token | Value | Used for |
| --- | --- | --- |
| `--bg` | `#fcfbf8` | Page — warm paper, not pure white |
| `--ink` | `#17150f` | Headlines, nav, wordmark |
| `--ink-soft` | `#3a362c` | Body copy, section headings |
| `--ink-muted` | `#6d6755` | Publication eyebrows |
| `--rule` | `#1a180f` | The 1px hairlines |
| `--rule-soft` | `#dcd6c8` | Reserved for lighter dividers |
| `--surface` | `#f1ebdd` | Publication cards |
| `--accent` | `#a8542f` | Oxblood; section headings, timeline labels and ticks |

Changing palette means editing these tokens **and** the two canvas bands' `data-bg` /
`data-fg` attributes (hero in `index.html`, banner in `research.html`), which are HTML
attributes rather than CSS and so do not inherit from the tokens.

Section headings (`.heading`) use `--accent`, as do the timeline's `ROLE` / `TALK` labels
and axis ticks. At `#a8542f` that measures 5.11:1 on the page background, clearing WCAG AA
at any size — which matters because the timeline labels render at 10.5px. An earlier,
lighter `#c0693f` sat at 3.8:1: fine for the large headings, failing for those labels.

The canvas bands still use the lighter `#C0693F` via their `data-fg` attribute. That is
deliberate — they are decorative marks rather than text, and the darker tone made the
dense areas read as heavy blocks.

Other contrast: body 11.6:1, publication titles 15.4:1, publication eyebrows 4.75:1 on the
card surface. `--ink-muted` is deliberately darker than it looks like it needs to be — at
`#77715f` the eyebrows fell to 4.1:1 and failed.

Type is **Wix Madefor Display / Text** (the reference's actual typeface, served from
Google Fonts) with **IBM Plex Mono** for nav, eyebrows and small labels.

Sizes are fluid (`vw`-based `clamp()`), tuned so that at a ~1250px viewport every
element occupies the same fraction of the page width as it does in the reference.

### The recurring motif

Every block sits under a hairline rule. That is the `.rule-top` class — it is the single
most load-bearing piece of the look, so keep applying it to any new block you add.

Layout sits on a **4-column grid**: the header nav occupies column 4, the hero canvas
spans columns 1–3 with the portrait in column 4, and the footer uses all four.

## Generative patterns

Two decorative bands — the home hero and the research-page banner — are drawn at runtime
onto `<canvas class="pattern">` rather than loaded as image files. A grid of glyphs (dots,
plus, ×, #, triangles, circles, squares) is sized and faded by a scalar field: a soft
elliptical bloom for the composition, plus heavily domain-warped sine noise so it never
reads as a concentric halftone.

The three Core Areas cards used to carry these too; they now end in a link icon out to the
matching project on the research page instead.

Tune any canvas from HTML alone:

| Attribute | Meaning |
| --- | --- |
| `data-bg` / `data-fg` | Background and glyph colour |
| `data-set` | `mixed`, `marks`, or `geo` — the glyph vocabulary |
| `data-seed` | Any number; changes the texture |
| `data-cell` | Grid cell size at a 1160px-wide canvas |
| `data-focus` | `"x,y"` in 0–1 — where the dense bloom sits |
| `data-spread` | Bloom radius |
| `data-stretch` | >1 widens the bloom horizontally |

Keep the foreground close in value to the background — the reference is very
low-contrast, and raising it makes the patterns read as heavy blobs.

## Motion

- Blocks fade and rise on scroll (`IntersectionObserver`, `.reveal` → `.is-in`).
  Stagger a block against its neighbour with `data-delay="120"` (milliseconds).
- Publication titles use a masked line-by-line reveal. Each line is
  `<span class="line"><span>…</span></span>`; lines are declared manually so the
  mask survives rewrapping. Stagger is automatic.
- All of it is disabled under `prefers-reduced-motion`.

## Swapping in real content

1. **Photos** — both slots are filled:
   - `portrait.jpg` (1100×1198) — hero, cropped to the slot's 900:980 ratio. A monochrome
     `portrait-bw.jpg` sits beside it; switch the `<img src>` to use it.
   - `sigmod-2026.jpg` (1160×1260) — About section, ACM SIGMOD/PODS 2026.

   Aspect ratios are set in CSS, so any reasonably-sized photo will crop cleanly.

   Source images are re-encoded through OpenCV, which writes no EXIF — the published
   JPEGs carry no camera, timestamp, or GPS data. Keep it that way if you swap them:
   phone photos are geotagged by default.
2. **Text** — all copy is plain markup in `index.html`; sections are commented.
3. **Publications** — duplicate an `<article class="pub">` block. Remember to split
   the title into `.line` spans.
There is no logo mark. The header is nav-only and the footer leads with the wordmark, so
identity rests on the typography alone. If one is ever added back, the header grid has
column 1 free for it and the mobile header would need `justify-content: space-between`
again instead of `flex-end`.

## My Research Journey (horizontal timeline)

Sits between About and Core Areas, covering education, roles and talks in one
left-to-right run. The axis is the `border-top` of `.timeline-track`; each `.tl-item`
marks it with an oxblood tick via `::before`. The in-progress entry (the PhD) carries
`.is-current`, which renders its tick hollow instead of solid.

The row scrolls horizontally rather than wrapping — `.timeline` owns the `overflow-x`
and the track is `width: max-content`, so the page itself never scrolls sideways. Items
are ~210–276px on desktop and `76vw` under 640px, so the next entry always peeks in and
signals that the row scrolls.

Entries are plain `<li>`s — add one and it joins the axis automatically. Keep them in
date order; nothing sorts them at runtime.

An entry can carry a photo by appending a `<figure class="tl-media">`. It goes **last**,
after `.tl-org` / `.tl-note`, so the titles of every entry stay aligned to the axis
whether or not they have an image. Images are cropped to 4:3 by CSS.

Photos are bottom-aligned via `margin-top: auto` on `.tl-media`, with `.tl-item` set to
`display: flex; flex-direction: column`. Because the row is a flex container every entry
shares a height, and because the photos share a width and ratio, aligning their bottoms
aligns their tops — so notes of different lengths don't stagger the photo band.

Photos deliberately sit **below** the text rather than above the axis: only half the
entries have one, and a top band would show the gaps as holes. See the note in
`style.css` above `.tl-media`.

## Link components

- `.card-link` — icon only, used at the foot of each Core Areas card. `margin-top: auto`
  floats it to the card's baseline, which is why `.research-grid` uses `align-items:
  stretch`: without it the cards size to their own content and the icons stop lining up.
- `.icon-link` — inline SVG plus a mono label, used for pre-print / repo / slides links.
- `.arrow-link` — the template's original text link with the trailing `>`, kept for
  navigation ("View All Publications", "Get in Touch").

Icons are inline SVG on `currentColor`, so they inherit colour and need no asset files.

## Research page

`research.html` lists the eight ongoing projects. Each is a row on the same 4-column
grid the header and footer use:

| Column | Contents |
| --- | --- |
| 1 | Index number and status (`Ongoing`, `Under review · KDD 2027`, …) |
| 2–3 | Title with a rule under it, then the abstract |
| 4 | Links — pre-print, GitHub, initial findings |

To add a project, copy an `<article class="project">` block and bump the number. Styles
live in `assets/css/research.css`; the shared page furniture (header, footer, contact,
patterns, reveals) comes from `style.css` and `main.js` unchanged.

## Outstanding items

- **CEUR link** points at the volume index (`Vol-3462`). It was the one reference in the
  CV with no embedded URL, so the direct paper link is still unknown.

There are no placeholder `#` links left in either page. The third cell of the footer's
second row is deliberately empty — it holds the 4-column rhythm so the copyright stays
under the socials.

All other URLs (arXiv pre-prints, GitHub repos, DOIs, LinkedIn, the robustness slide deck)
came from the link annotations embedded in the CV PDF. If the CV is updated, re-extract
them rather than retyping — `PyMuPDF` reads them with `page.get_links()`.

## Notes

- `Publications` and `Contact` are still in-page anchors on the home page. They can
  become standalone pages the same way `research.html` did.
- The reference is a Wix template, so its footer carried a "Powered and secured by Wix"
  line. That has been dropped as it does not apply here.
