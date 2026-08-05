# 🌤️ Gmail Weather Companion - Chrome Extension Setup

Install the Weather Companion directly into Google Chrome to view live weather forecasts and travel advice inside your actual **Gmail** inbox!

---

## 🚀 Step-by-Step Installation

### Step 1: Download or Save Extension Files
Click the **"Download Extension (.zip)"** button in the app to download all manifest and script files. Alternatively, copy the source code into a local folder named `gmail-weather-extension`.

### Step 2: Open Chrome Extensions
1. Open Google Chrome.
2. In the address bar, navigate to: `chrome://extensions` (or go to **Menu ➔ Extensions ➔ Manage Extensions**).

### Step 3: Enable Developer Mode
Toggle on **"Developer mode"** using the switch in the top-right corner of the Extensions page.

### Step 4: Load Unpacked Extension
1. Click the **"Load unpacked"** button in the top-left corner.
2. Select the `gmail-weather-extension` folder containing `manifest.json`.

### Step 5: Test on Gmail!
1. Open [mail.google.com](https://mail.google.com) in Chrome.
2. Open any email containing travel confirmation, flight itinerary, or event locations (e.g. Seattle, Austin, Banff, Tokyo).
3. The **Weather Companion Sidebar** will automatically pop up in Gmail!

---

## ⚡ Features
- 📍 **Auto Location Extraction**: Reads destination locations from emails using Gemini AI.
- 🌤️ **Real-Time Open-Meteo Weather**: 7-day forecasts, hourly temperatures, and rain probabilities.
- 👔 **Outfit & Travel Tips**: AI recommendations based on upcoming weather.
- ⚙️ **Configurable Endpoint**: Set custom API host URL in extension popup.
