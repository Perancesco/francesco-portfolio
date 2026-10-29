# Francesco Alexander — Portfolio

## Run locally
1. Extract this ZIP to a new folder.
2. Keep `index.html`, `styles.css`, `script.js`, and the `assets` folder together.
3. Open `index.html` or use VS Code Live Server.

## V12 changes
- Rebuilt a coherent warm light theme with dark ink typography and restrained lavender accents.
- Includes `assets/francesco-portrait.jpeg` so the hero portrait loads from the ZIP.
- Balanced the hero portrait crop and caption to fit the first screen more naturally.
- Replaced the empty About sidebar with a profile snapshot and existing portfolio stats.
- Reduced oversized section padding and tightened the rhythm between sections.
- Brighter, clearer project frames while preserving the dark UI inside product mockups.
- Improved text contrast, navigation, buttons, cards, and responsive layouts.
- Preserved the typing role animation and reduced-motion support.


V12.1 adjustment: hero photo uses a wider editorial crop on desktop while keeping a portrait crop on mobile; project-device mockups are scaled up for clearer presentation; content shell is wider on large screens to reduce unnecessary side gaps.


## V14 — Warm cream theme
- Replaced the cool, near-white background with a warm cream/paper palette.
- Tuned text to warm charcoal and muted brown-gray for readable contrast.
- Kept lavender as the primary accent and softened green/amber supporting accents.
- Harmonized header, cards, project frames, buttons, footer, and portrait caption with the cream palette.
- The cream theme stays consistent even if the browser/OS uses dark mode.


V14 visual update: added distinct warm-cream shading for the hero, work/projects, about, experience, toolkit, education, contact, and footer sections. Project artwork retains separate sage, oat, and lavender tints.


## V15 — Forest Green accent
- Changed the main accent palette to Forest Green `#456B59`.
- Changed the hero word “Execution” from hollow outline text to solid filled lettering, matching the filled accent treatment used by “practice.”
- Updated accent styling for section headings, active filters, text selection, and focus rings so the site no longer relies on a Claude-like purple/terracotta accent.


## V16 — Deep Forest
- Updated the accent palette from Forest Green to Deep Forest `#315C46`.
- Updated accent hover, selection, focus, and active-filter colors to match.
- Kept the warm cream background and dark text palette.


## V17 — Navbar and hero details
- Separated the navbar from the cream page with a soft sage-cream background, border, and subtle shadow.
- Restyled the three hero principles as small editorial chips with green markers and hover feedback.
- Improved the “Scroll to explore” row and its animated line.
- Added narrow-screen adjustments for the chips and scroll cue.

## Deploy to Vercel
This is a static HTML/CSS/JavaScript portfolio. It has no database, backend service, npm install, or build step.

1. Push this folder to a GitHub repository, or run `vercel` from this folder with the Vercel CLI.
2. In Vercel, select the **Other** framework preset, leave the Build Command blank, and set the Output Directory to `.`.
3. Keep `index.html`, `styles.css`, `script.js`, and `assets/` together in the project root so relative image paths continue to resolve.

Vercel's static-site setup does not need a build step for HTML, CSS, and client-side JavaScript. See [Vercel's static build guidance](https://vercel.com/docs/builds).
