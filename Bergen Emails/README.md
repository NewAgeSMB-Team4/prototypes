# Bergen Kids — email templates

Four transactional emails, built on the Bergen Kids palette and the wordmark.
600 px, table-based, responsive down to 320 px, tested against Outlook's quirks.

Open **`index.html`** for all four side by side, with a desktop / phone toggle.

| Scenario (QA sheet row) | Subject | File |
| --- | --- | --- |
| Email Verification — Login / signup | Verify Your Email | `verify-email.html` |
| Super Admin approves advertiser account | Advertiser Account Approved | `advertiser-approved.html` |
| Super Admin blocks advertiser account | Advertiser Account Blocked | `advertiser-blocked.html` |
| Super Admin unblocks advertiser account | Advertiser Account Reactivated | `advertiser-reactivated.html` |

Phone Verification was not requested and is not built. If you want it later it
is a copy of `verify-email.html` with one word changed — say so and I'll add it.

---

## The design

One card holds everything — mark, message and footer — on a soft sage page
(`#e9efe8`):

```
┌ card ──────────────────────────────────────┐
│ cream: the wordmark, nothing boxed round it│
│ HERO STRIP: eyebrow pill + headline        │  colour lives here
│ ▔▔▔▔ yellow into orange ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │
│ white: Hello, / the message                │
│        the code, or the status panel       │
│        the button                          │
│        ───────────────                     │
│        Regards, Bergen Kids                │
│ cream: green · yellow · orange accent      │
│        Bergen Kids                         │
│        Discover · Explore · Grow           │
│        automated line, support, copyright  │
└────────────────────────────────────────────┘
```

The card opens and closes on cream — the ground the wordmark is drawn for, so
the mark needs no plate behind it, and the footer sits on the same colour it
opened with rather than reading as a separate piece. The colour is carried by
the hero strip, the rule in the logo's own yellow and orange, and the code
block.

**Hero strip per message** — green for verification and approval, teal for
reactivation, navy for the block notice, which should not arrive looking
celebratory. The status panel underneath carries the semantic colour: mint,
rose, teal.

### Colours, all from the project

| | |
| --- | --- |
| logo green · yellow · orange | `#007f49` `#ffcf00` `#ff8a00` |
| brand green (buttons, links) | `#007f49`, deep `#20643d` |
| navy (headings, block hero) | `#1a2e4a`, body ink `#12233a` |
| cream page | `#fdf8f0` |
| mint / rose / teal panels | `#e3f2e9` `#fbe4e1` `#ddf1ec` |
| danger ink | `#a3271c` |

Type is the site's pairing: Georgia for the display headings, Inter with a
system fallback for everything else. No webfont is loaded — mail clients
mostly strip them, and Georgia ships with every OS.

---

## Placeholders to fill in

Replace these before sending — they use the same `{{ }}` form as the sample in
the QA sheet.

| Token | Where | Example |
| --- | --- | --- |
| `{{OTP}}` | verify-email only | `482913` |
| `{{login_url}}` | approved, reactivated | `https://app.bergenkids.com/login` |
| `{{support_email}}` | blocked, and every footer | `support@bergenkids.com` |

Every support link is a `mailto:` with the subject already filled in — the
blocked notice sends `Bergen Kids - blocked advertiser account`, the others
name their own scenario — so a reply arrives with context instead of blank.
Substituting `{{support_email}}` is enough; leave the `?subject=` part alone.
| `{{site_url}}` | the wordmark link, all four | `https://bergenkids.com` |
| `{{year}}` | footer copyright, all four | `2026` |

The wordmark is loaded from the CDN the app already uses
(`bergenapi.newagesmb.com/cdn/images/article-banner/…png`). Emails cannot use
local or base64 images reliably, so it has to be an absolute URL — swap it if
the asset ever moves. Everything else on the page is HTML and CSS, so there is
exactly one image to block and the mail still reads perfectly without it (the
alt text is styled to fall back to "Bergen Kids" in the brand green).

## Copy

The body copy is **exactly** what the QA sheet specifies — `Hello,` / the
sentence / `Regards, Bergen Kids` — so nothing there should trip a content
check. The headline repeats the subject line rather than inventing a new one.

Added by the design, and easy to delete if the admin panel should be the only
source of words:

- the eyebrow pill (`Account verification`, `Advertiser account`)
- the status panel under the message
- the button and the "or paste this into your browser" line
- the footer lines

## Client notes

- **Outlook (Windows, 2007–365)** — buttons are VML `roundrect`, so they keep
  their shape and colour. Gradients are ignored; every gradient has a `bgcolor`
  underneath, so the strips fall back to a flat brand colour. Rounded corners
  square off. All of that is intentional and still on-brand.
- **Light only.** The templates declare `color-scheme: light`. The wordmark is
  dark green on transparency: on an inverted ground it either disappears or
  needs a plate boxed around it, which is worse than not inverting. Apple Mail
  and Outlook honour the declaration. Gmail's apps apply their own inversion
  regardless — the palette is chosen so it survives that.
- **Phones** — one media query at 620 px: the card goes full width, padding
  drops to 24 px, the headline to 25 px, and the button becomes full width.
- The files are pure ASCII — every dash, arrow and symbol is an HTML entity, so
  no encoding surprise between your mailer, the CDN and the client.

## Sending

Paste the file into the admin panel's template field, or load it from disk and
substitute the tokens. Keep the `<style>` block: it carries the responsive
rules. Do not run it through a "minify HTML" step that strips comments — the
Outlook conditionals live in comments.

Worth doing once before go-live: send yourself all four and check them in
Gmail (web + Android), Apple Mail, and Outlook Windows. That is where the
edge cases live.

## Regenerating

All four come from one shell, so a change to the header, footer or palette
lands in every file at once:

```bash
cd _tools
node build-emails.js        # rewrites the four HTML files
```

`_tools/build-emails.js` holds the shell, the shared pieces (button, panel,
rules) and a config block per message — subject, headline, hero colour, body
copy. No dependencies.
