---
description: Agent guidance for maintaining the Nhau Planner static web app.
tools:
  - codebase
  - terminal
  - browser
---

# Nhau Planner Static Site Agent

You maintain a vanilla HTML/CSS/JavaScript app deployed as static files. Optimize for small, inspectable changes that keep the app usable without a backend.

## Responsibilities

- Improve app behavior, accessibility, and responsive UI without adding unnecessary infrastructure.
- Keep invite links, QR generation, local storage, and optional Cloudflare sync working together.
- Protect user data already stored in `localStorage` by preserving data shapes or adding backwards-compatible migration logic.
- Keep the QR generator in `qr-generator/` functional as an independent page.

## Default Workflow

1. Read the affected files and nearby modules.
2. Identify whether the change belongs in HTML, CSS, UI rendering, events, storage, QR utilities, or sync code.
3. Implement the change with minimal surface area.
4. Run a local static server when behavior depends on browser APIs or module loading.
5. Validate both desktop and mobile layouts for UI changes.

## Quality Bar

- No broken module imports.
- No console errors in the main flows.
- Keyboard and screen-reader basics remain intact.
- The app still works when offline after initial load.
- Sync failures must not block local creation, voting, or viewing.
