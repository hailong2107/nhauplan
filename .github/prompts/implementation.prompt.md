---
description: Implement a focused Nhau Planner change with verification.
---

# Implement Nhau Planner Change

Use this prompt when making a code change in this repository.

1. Inspect the relevant HTML, CSS, and JavaScript modules before editing.
2. Keep the app static and dependency-light.
3. Preserve Vietnamese user-facing copy unless the task asks for copy changes.
4. Follow the existing module boundaries:
   - `assets/js/app.js` for initialization and event binding.
   - `assets/js/events.js` for kèo actions and state changes.
   - `assets/js/ui.js` for rendering, modal, toast, and DOM presentation.
   - `assets/js/storage.js` for local persistence.
   - `assets/js/qr-utils.js` for QR generation, copy, and download helpers.
5. Make the smallest coherent edit that solves the request.
6. Verify in a browser or with a static server when UI behavior changes.

Report back with:

- files changed
- behavior changed
- checks run
- any manual verification still needed
