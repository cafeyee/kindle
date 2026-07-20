KINDLE DASHBOARD FINAL REPLACEMENT

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

After deployment, test /api/dashboard first, then open /?v=33 on Kindle.

V3.1 moves Chinese lunar dates into each monthly calendar cell. Lunar month names appear only on lunar day one, for example 六月初一.

V3.3 moves the mode button to the upper-right weather panel. Clicking the month title is a fallback toggle.
Mantra mode hides lunar labels. Lunar mode hides the mantra. Day 1 starts on 2026-07-20 Wellington time.
