# 🏬 Chrome Web Store Listing Content

Use the text below when submitting your extension in the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

### 📌 Extension Title
`Gmail Weather Companion - Smart Weather Sidebar`

### 📝 Short Summary (Max 132 chars)
`Live weather, interactive Doppler radar, and an AI weather summary right inside your Gmail inbox.`

### 📄 Detailed Description
```
Gmail Weather Companion puts live weather, an interactive radar map, and an AI weather summary right inside your inbox!

FEATURES:
• Destination Search: Look up any city or zip code — your last search is remembered automatically.
• Live Weather: Current conditions plus a 7-day forecast, powered by Open-Meteo.
• Interactive Doppler Radar: A live precipitation radar map you can pan and zoom.
• AI Weather Summary: A natural-language summary of current conditions, like "Sunny and breezy, with mild temperatures today."
• Docked Sidebar UI: Seamlessly sits inside mail.google.com without distracting from your workflow.

PRIVACY FIRST:
The extension does not use any account sign-in and does not send your email content anywhere. When an open email mentions a known city, that match happens entirely in your browser — nothing is transmitted. The only network requests are to Open-Meteo (weather/geocoding), RainViewer (radar tiles), and CartoDB (map base tiles).
```

---

### 🛡️ Single Purpose & Permission Justifications

**Single Purpose Statement:**
> "Displays live weather, an interactive radar map, and an AI weather summary for a user-selected location inside Gmail."

**Host Permission Justifications:**
> `https://api.open-meteo.com/*`, `https://geocoding-api.open-meteo.com/*` — Required to fetch current/forecast weather data and to resolve searched city/zip names to coordinates.
>
> `https://api.rainviewer.com/*`, `https://tilecache.rainviewer.com/*` — Required to load live precipitation radar tiles for the Doppler radar map.
>
> `https://*.basemaps.cartocdn.com/*` — Required to load the base map tiles the radar overlay is drawn on.

**Permission Justification (`storage`):**
> "Used to save the user's selected location and temperature unit via `chrome.storage.sync`, so settings persist and stay in sync between the popup and the Gmail sidebar."
