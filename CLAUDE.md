# Monogram OS

A clickable prototype of an operating system for The Monogram Club — a
strategy-led brand identity studio. Single self-contained `index.html`:
markup, styles and script in one file, no build step, no dependencies
beyond the Inter webfont. Open it in a browser to run it.

Current version: **V0.12** (title tag carries the version — bump it with
each meaningful pass).

## What it is

The prototype walks the studio's real workflow: Discovery feeds Strategy,
Strategy feeds the client-facing Brand Hub. The Brand Hub is the strongest
idea in it — the permanent home for a finished identity, not another PDF.

Views: Overview, Projects, Project detail, Clients, Tasks, Calendar,
Discovery, Brand Lab, Brand Hub, Documents, Assets, Templates, Monogram AI,
Generations, Settings.

## Design system

Defined as CSS custom properties on `:root`. Change tokens, not
one-off values.

- **Canvas** `#fbfbfb`, cards pure white, separated by a **hairline**
  (`--line`) rather than a shadow.
- **Elevation is information.** Nothing floats at rest. `--sh-2` on hover,
  `--sh-3` for things that genuinely overlay (modals, toasts). Never put the
  same shadow under everything — that is what makes a UI read as templated.
- **Radius is a hierarchy**: `--r-card` 20px, `--r-ctl` 12px, `--r-well`
  10px, pills for chips. One radius everywhere is a tell.
- **Type**: Inter only. Titles 34px/700 at -0.04em tracking (the studio's
  Inter Black treatment). Body 14px, secondary 12-12.5px. **Nothing below
  11px** except the miniature inside the Brand Hub preview. Figures use
  `font-variant-numeric: tabular-nums`.
- **Status chips**: one semantic set — `.chip.good` / `.warn` / `.bad` /
  `.info`, low-tint background with matching ink. Used for task priority,
  project health, client status, live indicators.
- **Gradients** (`--g1`…`--g6`): soft grainy mesh fields in pink, lilac,
  meadow green, ocean blue, dusk and peach, each over a `--noise` turbulence
  layer. These are the brand layer — keep them for covers, thumbs and the
  Brand Hub art, not for chrome.
- **Dark panels** (feature card, Monogram AI, Brand Lab, synthesis blocks):
  `#121316` with a 1px inner top highlight and a deep diffuse base, so they
  read as a material rather than a black rectangle.
- **Icons**: Iconly (open-source Essential set, MIT, from `react-iconly`),
  inlined as an SVG sprite at the top of `<body>`. Light style by default,
  Bold for the active nav item. Reference them with
  `<use href="#i-<Name>-light">`. No CDN — the file works offline.

## House rules

- Sentence case for labels. No tracked all-caps eyebrows above page titles —
  the title carries the page.
- No decorative arrows appended to button text.
- Buttons say what happens: "Publish hub", not "Submit".
- Keep it one file. Keyboard focus visible, `prefers-reduced-motion`
  respected, works down to 390px.

## State

Discovery answers persist to `localStorage` under `monogram-disc`; every
read and write is wrapped in try/catch. Checkmarks, the "x of 5 completed"
count, the progress bar and the Approve gate all derive from those answers —
don't hardcode them. Task counts in the sidebar and stat tiles derive from
the DOM via `syncTasks()`.

The Brand Hub preview is themed by `HUB_THEME` and `applyTheme()`: editing a
colour or the display face in the Colours/Fonts sections retints the live
preview. That demo is the point of the Brand Hub — keep it working.

## Checking work

There is no test suite. After a change, open `index.html` in a browser and
click through the views you touched; check the console is clean and look at
it at 390px wide. If a headless browser is available, screenshot each view
and actually look at the result rather than assuming.

## Known gaps

- Everything is prototype data; actions fire a toast, nothing persists
  except Discovery.
- Brand Lab generation is a toast, not a model call.
- Calendar is October 2026 only, hardcoded events.
- Documents, Assets, Templates and Settings are the thinnest views.
