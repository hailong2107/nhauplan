---
applyTo: "**"
---

# Nhau Planner Project Instructions

Nhau Planner is a static, Vietnamese-first web app for planning group drinking/food meetups. Keep changes compatible with GitHub Pages and simple static hosting.

## Architecture

- Main app entry: `index.html`.
- Main styles: `assets/css/styles.css`.
- JavaScript is split into ES modules under `assets/js/`.
- QR generator is a separate static tool under `qr-generator/`.
- Optional server sync lives in `assets/js/cloudflare-api.js`; the app must remain local-first without a configured API.
- Do not introduce a build step, package manager, framework, or bundler unless the task explicitly requires it.

## Product Behavior

- Preserve Vietnamese UI copy and tone.
- Keep the core flow fast: create kèo, invite by link/QR, vote, manage participants, export calendar data, search/filter.
- Invite-only data must stay accessible by invite token and hidden from unrelated invite views.
- Local data should continue to work through `localStorage` when offline or when Cloudflare sync is unavailable.

## Implementation Guidelines

- Prefer existing helper modules such as `utils.js`, `storage.js`, `events.js`, `ui.js`, and `qr-utils.js`.
- Keep DOM selectors stable unless updating all dependent code.
- Use accessible labels, focus behavior, and `aria-live` regions for interactive UI.
- Avoid unrelated refactors; this project favors small, readable vanilla HTML/CSS/JS changes.
- Keep CSS responsive and check mobile layouts when touching UI.
- External CDN dependencies should be minimal and justified.

## Verification

- For static checks, run a local server from the repo root:

```bash
python3 -m http.server 8000
```

- Then verify:
  - `http://localhost:8000/`
  - `http://localhost:8000/qr-generator/`
  - create kèo flow
  - invite-only link and QR generation
  - search/filter behavior
  - light/dark theme toggle
