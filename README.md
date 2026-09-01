# 🌤️ Gmail Weather Companion - Chrome Extension Setup

Install the Weather Companion directly into Google Chrome to view live weather forecasts, an interactive Doppler radar map, and a plain-language weather summary inside your actual **Gmail** inbox!

---

## 🚀 Step-by-Step Installation

### Step 1: Get the Extension Files
Clone or download this repository — the extension files live at the repo root (`manifest.json`, `content.js`, `popup.html`, `popup.js`, `styles.css`, `leaflet.js`, `leaflet.css`, `icons/`).

### Step 2: Open Chrome Extensions
1. Open Google Chrome.
2. In the address bar, navigate to: `chrome://extensions` (or go to **Menu ➔ Extensions ➔ Manage Extensions**).

### Step 3: Enable Developer Mode
Toggle on **"Developer mode"** using the switch in the top-right corner of the Extensions page.

### Step 4: Load Unpacked Extension
1. Click the **"Load unpacked"** button in the top-left corner.
2. Select this repository's folder (the one containing `manifest.json`).

### Step 5: Test on Gmail!
1. Open [mail.google.com](https://mail.google.com) in Chrome.
2. Click the weather toggle button that appears on the page, or the extension icon in the toolbar.
3. Search any city or zip code, or open an email mentioning a supported city to auto-detect a trip location.

---

## ⚡ Features
- 📍 **Destination Search**: Look up any city or zip code, with the result saved for next time.
- 🌤️ **Real-Time Open-Meteo Weather**: Current conditions and a 7-day forecast.
- 📡 **Live Doppler Radar**: An interactive Leaflet map with real-time precipitation tiles from RainViewer.
- ✨ **AI Weather Summary**: A natural-language summary of current conditions (e.g. "Sunny and breezy, with mild temperatures today.") built from live temperature, sky conditions, and wind.
- 📧 **Local Email Context**: When an open Gmail message mentions a known city, the sidebar highlights it — matching happens entirely in your browser, nothing is sent anywhere.
- ⚙️ **Synced Settings**: Saved location and temperature unit sync across the popup and the Gmail sidebar via `chrome.storage.sync`.

No account sign-in, no custom backend server, no AI API key required — weather, geocoding, and radar data come directly from free public APIs (Open-Meteo, RainViewer, and CartoDB basemap tiles).
