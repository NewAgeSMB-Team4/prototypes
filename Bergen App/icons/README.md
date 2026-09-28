# Bergen Kids — icon set

Every icon used in the Bergen Kids app prototype, exported as standalone SVG.
Extracted from the sprite in `../index.html`, so these are the exact shapes the
prototype renders — no redraws, no substitutions.

Open **`preview.html`** in a browser for a contact sheet of all 50.

## The files

| | |
|---|---|
| `*.svg` | 54 UI icons — 24 × 24, stroke only |
| `illustrations/` | the splash / sign-in artwork: `hills-splash.svg`, `hills-signin.svg`, `sun.svg`, `kite.svg` |

The Bergen Kids wordmark is **not** here — it is a hosted PNG
(`https://bergenapi.newagesmb.com/cdn/images/article-banner/…png`), not part of
the sprite. Ask design for the vector original.

## Icon spec

All 50 icons share one geometry, so they can be driven by a single component:

```
viewBox            0 0 24 24
fill               none
stroke             currentColor
stroke-width       1.9
stroke-linecap     round
stroke-linejoin    round
```

A few icons (`tag`, `palette`, `star`) contain small filled dots that carry
`fill="currentColor" stroke="none"` inline — they inherit the same colour, so
nothing special is needed.

Rendered sizes used in the prototype run 12–26 px; the tab bar uses 21 px,
the centre action button 26 px, and inline label icons 13–16 px.

## Using them in React Native

With `react-native-svg-transformer`, import as components:

```js
import HomeIcon from './icons/home.svg';

<HomeIcon width={21} height={21} color="#2d7a4f" />
```

Because every path uses `currentColor`, `color` (or `stroke`) is the only prop
needed to theme an icon — active tab green `#2d7a4f`, inactive `#78899c`.

If you prefer a single lookup component:

```js
const ICONS = {
  home: require('./icons/home.svg'),
  search: require('./icons/search.svg'),
  // …
};
```

## Where they are used

| Icon | Used for |
|---|---|
| `home` `book` `calendar` `user` | parent tab bar |
| `dashboard` `tag` `megaphone` `chart` `user` | advertiser tab bar |
| `search` `sliders` `x` `chev-left` `chev-right` `arrow-right` `plus` `check` | navigation and controls |
| `bell` `mail` `phone` `globe` `pin` `clock` `lock` `card` `image` `upload` `edit` `trash` `logout` | actions, contact rows, forms |
| `eye` `click` `trending` `star` | analytics tiles |
| `stethoscope` `school` `book` `palette` `soccer` `music` `tent` `cake` `waves` `theater` `tooth` | category and listing icons (chosen by data, so keep all of them) |
| `users` | audience / age-range labels |
| `sun` `moon` `device` `info` | Appearance screen — light / dark / system theme picker |

Six icons are defined in the prototype but never rendered on a screen —
they are shipped here for completeness and shown faded in `preview.html`:

`chev-down` · `eye-off` · `briefcase` · `settings` · `verified` · `heart`

## Illustrations

The layered horizon behind the entry screens comes in two cuts of the same
scene — `hills-splash.svg` with the stand of pines for the splash, and
`hills-signin.svg`, bare hills, for the sign-in and verify screens, where the
form reaches far enough down that trees only crowd it. Both are 393 × 270,
designed to sit flush with the
bottom of the screen and scale to the device width. `sun.svg` and `kite.svg`
are the corner decorations. These use fixed brand colours, not `currentColor`:

`#2d7a4f` grass · `#1e8c7a` teal · `#f5a623` sun · `#1a2e4a` navy · `#fdf8f0` cream
