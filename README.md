# Kindle Dashboard for Paperwhite 2

Upload all files and the `api` folder to the root of the same GitHub repository already connected to Vercel.

Required structure:

    index.html
    style.css
    script.js
    api/weather.js

In GitHub, use **Add file > Upload files**, drag the three files plus the `api` folder contents, then commit to `main`. Vercel should redeploy automatically.

This version uses ES5 JavaScript in the Kindle browser and a same-origin Vercel serverless weather proxy.
