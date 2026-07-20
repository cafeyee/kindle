KINDLE DASHBOARD V3.2

Upload this exact structure to the GitHub repository root:

index.html
style.css
script.js
vercel.json
api/dashboard.js

Vercel settings:
Framework Preset: Other
Root Directory: ./
Build Command: empty
Output Directory: empty
Install Command: empty

After deployment, test /api/dashboard first, then open /?v=32 on Kindle.

Modes:
Lunar mode shows lunar dates inside the calendar and hides the mantra.
Mantra mode shows the daily mantra and hides lunar dates in the calendar.
The toggle button is in the footer. The selected mode is saved in localStorage.

Mantra cycle:
Day 1 starts on 2026-07-20 Wellington time. Edit MANTRA_START in api/dashboard.js if needed.
