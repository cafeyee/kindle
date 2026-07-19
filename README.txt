KINDLE DASHBOARD - DEPLOYMENT

Files must be uploaded with this exact structure:

index.html
style.css
script.js
vercel.json
api/dashboard.js

Vercel settings:
Framework Preset: Other
Root Directory: ./
Build Command: leave empty
Output Directory: leave empty
Install Command: leave empty

After uploading these files to the existing GitHub repository, Vercel should deploy automatically.
The Kindle page refreshes weather every 30 minutes. The clock updates every 30 seconds.
The weather API is called by Vercel, not directly by the old Kindle browser.
