# Screen backgrounds — Bergen Kids app

Artwork only for the two entry-screen backdrops. **No logo, no tagline, no
buttons, no form** — those are drawn by the app on top of these images.

| Set | Screens | What's in it |
| --- | --- | --- |
| `welcome-bg-*` | Welcome | sky, sun, drifting dots, wooded horizon (pines) |
| `signup-bg-*` | Sign up, Log in, Verify code | sky, kite, bare horizon (no trees) |

Both are drawn at 393 × 852 points — iPhone 15 Pro logical size, ~19.5:9.

---

## Welcome screen — `welcome-bg-*`

| File | Size | Use |
| --- | --- | --- |
| `welcome-bg-light.svg` | 393 × 852, vector | source of truth, scales to any size |
| `welcome-bg-light.png` | 393 × 852 | @1x |
| `welcome-bg-light@2x.png` | 786 × 1704 | @2x |
| `welcome-bg-light@3x.png` | 1179 × 2556 | @3x |
| `welcome-bg-dark.svg` | 393 × 852, vector | source of truth |
| `welcome-bg-dark.png` | 393 × 852 | @1x |
| `welcome-bg-dark@2x.png` | 786 × 1704 | @2x |
| `welcome-bg-dark@3x.png` | 1179 × 2556 | @3x |

The sun sits 14pt from the right and 18pt from the top, so keep it clear of any
status-bar overlay if you extend the image under it.

## Sign-up screen — `signup-bg-*`

| File | Size | Use |
| --- | --- | --- |
| `signup-bg-light.svg` | 393 × 852, vector | source of truth, scales to any size |
| `signup-bg-light.png` | 393 × 852 | @1x |
| `signup-bg-light@2x.png` | 786 × 1704 | @2x |
| `signup-bg-light@3x.png` | 1179 × 2556 | @3x |
| `signup-bg-dark.svg` | 393 × 852, vector | source of truth |
| `signup-bg-dark.png` | 393 × 852 | @1x |
| `signup-bg-dark@2x.png` | 786 × 1704 | @2x |
| `signup-bg-dark@3x.png` | 1179 × 2556 | @3x |

The same ground as the welcome screen, cut shorter: the scene box is 200pt
rather than 270pt and the pines are dropped, because the form reaches far
enough down that trees only crowd it. One image covers all three auth steps —
sign up, log in and verify code share this backdrop.

The kite sits 18pt from the right and 16pt from the top; same status-bar caveat
as the sun. The sky gradient is a hair different from the welcome one (stops at
44% / 76% instead of 38% / 66%) — that is the app's, not a slip, so don't
substitute one file for the other.

## How to place either one

**Scale to fill and pin to the bottom** (`aspect-fill` + bottom alignment; CSS
`background-size: cover; background-position: bottom`). The horizon belongs at
the bottom edge; the sky above it is a plain gradient, so cropping or stretching
the top costs nothing. Cropping the left and right is safe too — the trees sit
inboard of both edges, and the bare horizon spans the full width.

## Which one to show

`light` under `UITraitCollection.userInterfaceStyle == .light` /
`Configuration.uiMode` day, `dark` for the other. Each pair is the same drawing
— the dark one uses the app's night sky gradient, dims the horizon to 14% and
the sun / kite to 55%, exactly as the running app does.

## Notes

- Colours come straight from the app (`Bergen App/index.html`): `.bk-sky` and
  its `[data-theme="dark"]` override for the sky, and the `SUN` / `KITE` /
  `HILLS` / `TREES` constants for the artwork. Regenerate from the SVGs if
  either changes.
- The dark sky is a deliberately narrow gradient (`#101b17 → #0d1b16`), so on
  8-bit displays it can show faint banding — the same as in the app. If your
  devs would rather avoid it, a flat `#0f1915` fill is a fine substitute.
- The SVGs are the master. The PNGs were rendered from them; re-export at any
  density you need rather than upscaling a PNG.
