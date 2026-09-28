# Bergen Kids — React Native asset pack

Every piece of artwork the app prototype draws, exported for React Native in
**light and dark**, at **@1x / @2x / @3x**, plus the vector masters.

Nothing here was redrawn. Icons come out of the sprite in `../index.html`,
the illustrations out of the `HILLS` / `SUN` / `KITE` constants, and every
colour out of the prototype's own stylesheet — including the dark-mode rules,
so the dark files look exactly like the running app with the theme flipped.

**Open `preview.html`** for a contact sheet of all 79 assets with a light/dark
toggle.

```
79 assets · 466 PNG + 82 SVG · 5.0 MB
```

---

## What's in the box

| Folder | Assets | Base size | What it is |
| --- | --- | --- | --- |
| `icons/` | 56 | 24 × 24 pt | every icon in the sprite, stroke-only |
| `illustrations/` | 4 | see below | hills (two cuts), sun, kite — transparent |
| `backgrounds/` | 3 | 393 × 852 pt | the three entry screens, composed and ready to place |
| `brand/` | 4 | see below | the Bergen Kids wordmark, plus a derived app icon |
| `placeholders/` | 9 | 360 × 240 | what a frame shows when its photo is missing |
| `system/` | 3 | 17–26 pt | prototype status-bar chrome (you probably don't need these) |
| `tokens/` | — | — | `colors.json`, `gradients.json` — the values behind all of it |

Each folder holds the same three things:

```
icons/
  svg/            vector master — one file, both themes
  light/          name.png · name@2x.png · name@3x.png
  dark/           same names, dark treatment
```

**Every asset exists under both `light/` and `dark/`, always under the same
name.** A few (the photo placeholders) look identical in the two themes because
the app doesn't change them — the file is still there, so a theme lookup can
never hit a missing path.

---

## Using it

### PNG — no extra tooling

```js
import { Icons, Backgrounds, resolve } from './rn-assets/assets';
import { Image, ImageBackground, useColorScheme } from 'react-native';

const scheme = useColorScheme();                    // 'light' | 'dark'

<Image source={resolve(Icons.home, scheme)} style={{ width: 24, height: 24 }} />

<ImageBackground
  source={resolve(Backgrounds['welcome-bg'], scheme)}
  resizeMode="cover"
  style={{ flex: 1, justifyContent: 'flex-end' }}
/>
```

`assets.js` is generated from the folder, so it lists everything; Metro picks
the right density for the device on its own. Exported maps: `Icons`,
`Illustrations`, `Backgrounds`, `Brand`, `Placeholders`, `System`.

### SVG — sharper, and one icon file per icon

With `react-native-svg` + `react-native-svg-transformer`:

```js
import { IconsSvg } from './rn-assets/assets.svg';

const Home = IconsSvg.home;
<Home width={21} height={21} color="#2d7a4f" />
```

Every icon path is `currentColor`, so `color` is the only prop needed — no
light and dark files, and no PNG at all if you go this route. The rendered
sizes in the prototype run 12–26 px: tab bar 21, centre action button 26,
inline label icons 13–16.

### Tinting the PNGs

The icon PNGs are flat single-colour shapes on transparency, so
`<Image tintColor="#2d7a4f">` re-colours any of them. Ship-colour defaults:
active tab `#2d7a4f` light / `#6cc490` dark, inactive `#78899c` light /
`#a0b4a8` dark.

---

## What changes between light and dark

Taken straight from the `[data-theme="dark"]` rules:

| | Light | Dark |
| --- | --- | --- |
| icon ink | `#1a2e4a` | `#e9f2ec` |
| sky gradient | `#fffdf7 → #eff8ea` | `#101b17 → #0d1b16` |
| hills | full strength | same drawing at **14 %** opacity |
| sun · kite | full strength | same drawing at **55 %** opacity |
| wordmark green | `#007f49` (brand) | `#6cc490` (the app's dark-mode green) |
| placeholders | unchanged | unchanged |

The dimming is **baked into the dark files**. Don't apply opacity again on
top — drop the dark asset onto the dark background and it matches the app.

---

## Notes per folder

### `backgrounds/` — the three entry screens

| File | Screens | Contents |
| --- | --- | --- |
| `splash-bg` | Splash | sky only; the app draws the wordmark on top |
| `welcome-bg` | Welcome | sky, sun, three drifting dots, wooded horizon |
| `signup-bg` | Sign up · Log in · Verify code | sky, kite, bare horizon |

Drawn at 393 × 852 pt (iPhone 15 Pro logical size, ~19.5:9).
**Scale to fill, pinned to the bottom** (`resizeMode="cover"`) — the horizon
belongs at the bottom edge and the sky above it is a plain gradient, so
cropping the top costs nothing. Cropping left/right is safe too.

No logo, no tagline, no buttons, no form: those are app UI, not artwork.

The sign-up sky is a hair different from the welcome one (stops at 44 % / 76 %
instead of 38 % / 66 %) — that's the app's doing, not a slip, so don't
substitute one file for the other. One image covers all three auth steps.

The sun sits 14 pt from the right and 18 pt from the top, the kite 18 pt and
16 pt — keep them clear if you extend the image under the status bar.

### `illustrations/` — the same artwork, loose

`hills-splash` (393 × 270, with the stand of pines) · `hills-signin`
(393 × 270, bare) · `sun` (104 × 104) · `kite` (58 × 58). Transparent, meant to
be layered on the sky yourself if you'd rather build the screen from parts than
use the composed background. The sign-in screen shows the **bottom 200 pt** of
its hills cut, bottom-aligned.

### `icons/` — 56, one geometry

```
viewBox 0 0 24 24 · fill none · stroke currentColor
stroke-width 1.9 · linecap round · linejoin round
```

A few (`tag`, `palette`, `star`) carry small filled dots as
`fill="currentColor" stroke="none"` — same colour, nothing special needed.

Five icons are in the sprite but never referenced by name anywhere in the app
code: `eye-off` · `settings` · `verified` · `dashboard` · `heart`. They're
shipped anyway and shown faded in `preview.html`. `play` and `video` **are**
used (the video tiles) — they were missing from the older `../icons/` export.

Category and listing icons are chosen by data (`stethoscope`, `school`, `book`,
`palette`, `soccer`, `music`, `tent`, `cake`, `waves`, `theater`, `tooth`), so
keep all of them even if a screen you're building doesn't name them.

### `placeholders/` — the branded photo hole

The prototype pulls demo photography from picsum/Unsplash, and every frame sits
on its category gradient with the category icon watermarked in, so a photo that
fails to load leaves a branded panel rather than a hole. These are that panel,
one per category plus `ad-creative` for banner ads. 3:2, safe to stretch.

Gradient values are in `tokens/gradients.json` if you'd rather draw them live
with `react-native-linear-gradient` and skip the PNGs.

### `brand/` — the wordmark

| File | Size | |
| --- | --- | --- |
| `wordmark` | 238 × 112 pt | the lockup **exactly as the splash and welcome screens crop it** — drop it straight in |
| `wordmark-full` | 320 pt wide | the untouched CDN artwork, full margins |
| `app-icon-1024` | 1024 × 1024 | **derived** — see below |
| `mark-512` | 512 pt wide | **derived** — the hand alone, transparent |

The wordmark is a hosted PNG
(`bergenapi.newagesmb.com/cdn/images/article-banner/…png`), not a vector.
**Ask design for the vector original before shipping** — the source is
1079 px wide and the lockup at @3x already uses 714 of them, so there is
little headroom above these sizes.

The dark version lifts the brand green to `#6cc490`, the green the app itself
uses for `.text-grass` in dark mode; the yellow and orange are untouched. The
prototype currently shows the same green artwork in both themes, where it lands
at about 3.5:1 against the night sky — use the dark file if you want that
fixed, or the light file in both themes to match the prototype exactly.

`app-icon-1024` and `mark-512` are **derived, not from the prototype** — the
app has no square launcher icon, so this is the hand mark centred on the theme
ground as a starting point. Confirm with design before it goes to a store.

### `system/` — status-bar chrome

`status-signal`, `status-wifi`, `status-battery`. The prototype draws a fake
status bar; a real app gets these from the OS. Shipped only so the export is
genuinely complete.

---

## Naming and densities

`name.png` · `name@2x.png` · `name@3x.png` — the RN convention, so
`require('./icons/light/home.png')` resolves the right one. Names are
kebab-case; Metro rewrites them for Android drawables automatically, so
hyphens are safe.

`app-icon-1024` and `mark-512` are single-density source files, not RN image
assets — they exist for the store listing and the launcher pipeline.

## What is deliberately **not** here

- **Demo photography.** Listing, event, guide and ad photos come from
  `picsum.photos` and `images.unsplash.com` at runtime. They're stand-ins, not
  Bergen artwork — use the placeholders above until real photography lands.
- **Advertiser logos.** Third-party marks supplied per campaign.
- **Fonts.** Inter (Google Fonts) for UI, Georgia for display headings.

## Regenerating

Everything is rebuilt from `../index.html` — if the prototype's colours or
artwork change, re-export rather than editing a PNG. The SVGs in each `svg/`
folder are the masters; the PNGs were rendered from them, so re-render at any
density you need rather than upscaling.

The exporter ships with the pack:

```bash
cd _tools
npm install          # @resvg/resvg-js + sharp
npm run build        # rewrites every folder, plus assets.js and preview.html
```

`build.js` reads the sprite, the illustration constants and the theme CSS out
of the prototype; `docs.js` regenerates `assets.js`, `assets.svg.js` and
`preview.html` from whatever ended up on disk, so the maps can't drift from
the folder. The hosted wordmark is cached as `_tools/logo-remote.png` and
re-fetched if you delete it.

This pack supersedes the older `../icons/` and `../export/` folders, which
covered 54 of the 56 icons and two of the three backgrounds.
