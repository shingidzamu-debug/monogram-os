# Changelog

## Phone layout fix
- Overview, Project, Tasks and Monogram AI no longer scroll sideways on
  phones: two-column rows stack below 800px and grid items can shrink.

## Next.js shell
- Added a Next.js 16 project around the single-file app so it can deploy to
  Vercel. `index.html` is split at build time by `scripts/build-legacy.mjs`;
  the app runs unchanged.

## V1.0 — ready for daily use
- Clients, projects, tasks and calendar events are real records saved in the
  browser (`monogram-db`), with create, edit and delete forms.
- Overview stats, today list, active projects, activity and sidebar counts all
  derive from the data; dates are relative to today.
- Project detail: stage bar sets the stage, workspace notes (brief, strategy,
  direction, files) save as you type, palette and personality are editable.
- Discovery is per project with a project picker; approval is recorded.
- Tasks board: Today (incl. overdue) / Coming up / Waiting, filter by project;
  completed tasks stay visible for the rest of the day.
- Calendar navigates months and shows events, project deadlines and task due
  dates, plus a month agenda; click a day to add an event.
- Search (⌘K) finds projects, clients, tasks, events and pages.
- Settings: editable profile, download/restore backup, load sample, erase all.

## V0.12 — premium pass
- Canvas to #fbfbfb; cards separated by hairline, shadow reserved for
  hover and overlays.
- Radius as hierarchy (20/12/10/pill) instead of one value everywhere.
- Type scale rebuilt: 34px/700 titles at -0.04em, tabular figures.
- Dark panels given inner top highlight + deep base so they read as material.
- Removed tracked all-caps eyebrows above page titles, and decorative
  arrows from button labels.
- Feature-card glow pulled into the corner instead of a centred blob.
- Monogram AI view filled out with Recent threads and Context in use.

## V0.11 — product-UI pass
- Cool grey canvas, white cards, soft two-step shadow.
- Semantic chip system (good/warn/bad/info) across tasks, projects, clients.
- Stat tiles reworked: icon well, label + delta chip, large figure.
- Tasks rebuilt as a board with per-column counts and add affordances.
- Project cards gained stage chip, health chip, progress bar and meta line.
- Clients table gained monogram avatars.
- Sidebar plan card; mobile topbar labels drop instead of wrapping.

## V0.10 — icons
- Replaced the iconly.ai CDN with an inlined Iconly SVG sprite
  (open-source Essential set, MIT). Works offline.
- Light style by default, Bold for the active nav item.

## V0.9 — Iconly CDN (superseded by V0.10)

## V0.8 — gradients and type
- Swapped all purple/cyan gradients for six soft grainy mesh fields.
- Dropped Cal Sans; Inter (variable) throughout.

## V0.7 — correctness and accessibility
- Type floor raised off 7-9px.
- Discovery answers persist; progress derives from real answers.
- Mobile drawer nav; side panels reflow instead of disappearing.
- Brand Hub preview themed by client tokens.
- Calendar weekday offset, today highlight; task counts made consistent.
- Keyboard access for clickable cards, modal focus handling.

## V0.6 — starting point
