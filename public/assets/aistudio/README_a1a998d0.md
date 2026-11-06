# Homepage refinement package

This package updates **only the homepage content and its presentation**. It reuses the existing portfolio navigation, portrait, smoke canvas, page transitions, and theme switch. The About, Education, Skills, Projects, and Contact section content remains managed by the existing `js/main.js`.

## Install into the existing GitHub repository

1. Download and unzip this package.
2. Copy `css/homepage-refinement.css` into your repository's `css/` folder.
3. Copy `js/homepage-refinement.js` into your repository's `js/` folder.
4. Replace the repository's `index.html` with the `index.html` in this package. It keeps the same existing asset paths and adds the two refinement files.
5. Do **not** delete or replace your existing `css/style.css`, `js/main.js`, `js/smoke.js`, or `assets/portrait.jpg`.
6. Commit and push the changes to GitHub Pages.

## What changes

- A calmer medieval-inspired palette: charcoal, warm stone, parchment, and muted brass.
- A working light/dark theme toggle, using the existing theme logic and saved preference.
- A shorter homepage introduction with the key facts separated into clear information panels.
- A subtle reveal animation for the homepage text and information panels.
- A quieter smoke background so it supports the content instead of dominating it.
- The other portfolio sections are left as they are.

The toggle and smoke interaction are supplied by your existing `js/main.js` and `js/smoke.js`; this package preserves those files.
