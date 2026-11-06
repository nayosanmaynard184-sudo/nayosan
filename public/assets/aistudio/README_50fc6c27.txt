SMOKE CURSOR EFFECT — FILE GUIDE

This is an original, lightweight recreation of a cursor-following smoke trail.
It is not a copy of the CodePen author's source code and does not use WebGL.
It uses HTML, CSS, JavaScript, and the Canvas 2D API.

FILES
- index.html  Demo page and canvas element
- style.css   Page layout and canvas positioning
- script.js   Smoke particle animation

RUN IT
1. Keep all three files in the same folder.
2. Open index.html in a modern browser.
3. Move your mouse or touch the page to create smoke.

USE IT IN AN EXISTING WEBSITE
1. Copy the <canvas id="smoke-canvas" aria-hidden="true"></canvas> element
   into your page, preferably near the start of <body>.
2. Add <link rel="stylesheet" href="style.css"> inside <head>.
3. Add <script src="script.js" defer></script> before </body> or in <head> with defer.
4. Keep the canvas above the page background but behind interactive content.
   The provided CSS uses pointer-events: none so it will not block clicks.

GITHUB PAGES
Upload index.html, style.css, and script.js to the same published directory.
No build step, npm install, or backend is required.

CUSTOMIZE
In script.js, adjust settings.maxParticles, particlesPerStep, spacing,
baseLife, and rise to change the density and feel of the smoke.
