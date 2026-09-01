/**
 * Gmail Weather Companion - Content Script
 * Injects modern weather sidebar natively into mail.google.com
 */

(async function () {
  if (document.getElementById('gwc-sidebar-panel')) return;

  // Preset Top Cities Database (Defaulted to Waukee, Iowa 50263)
  const CITY_DB = [
    { name: "Waukee", lat: 41.6119, lng: -93.8858, full: "Waukee, IA 50263, USA" },
    { name: "Des Moines", lat: 41.6005, lng: -93.6091, full: "Des Moines, IA, USA" },
    { name: "Austin", lat: 30.2672, lng: -97.7431, full: "Austin, TX, USA" },
    { name: "Chicago", lat: 41.8781, lng: -87.6298, full: "Chicago, IL, USA" },
    { name: "Banff", lat: 51.1784, lng: -115.5708, full: "Banff, AB, Canada" },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503, full: "Tokyo, Japan" },
    { name: "London", lat: 51.5074, lng: -0.1278, full: "London, UK" },
    { name: "Paris", lat: 48.8566, lng: 2.3522, full: "Paris, France" },
    { name: "New York", lat: 40.7128, lng: -74.0060, full: "New York, NY, USA" },
    { name: "Seattle", lat: 47.6062, lng: -122.3321, full: "Seattle, WA, USA" },
    { name: "San Francisco", lat: 37.7749, lng: -122.4194, full: "San Francisco, CA, USA" },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437, full: "Los Angeles, CA, USA" },
    { name: "Miami", lat: 25.7617, lng: -80.1918, full: "Miami, FL, USA" }
  ];

  const stored = await chrome.storage.sync.get(['gwc_unit', 'gwc_saved_city']);
  let currentUnit = stored.gwc_unit || 'F';
  let currentCity = stored.gwc_saved_city || CITY_DB[0];

  // 1. Create Floating Toggle Button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'gwc-toggle-btn';
  toggleBtn.title = 'Open Gmail Weather Companion';
  toggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
    </svg>
  `;
  document.body.appendChild(toggleBtn);

  // 2. Create Main Sidebar Panel
  const panel = document.createElement('div');
  panel.id = 'gwc-sidebar-panel';
  panel.innerHTML = `
    <div class="gwc-header">
      <div class="gwc-brand">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>
        </svg>
        <span>Weather Companion</span>
      </div>
      <button class="gwc-close-btn" id="gwc-close-btn" title="Close Panel">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="gwc-body">
      <div class="gwc-search-box">
        <input type="text" class="gwc-search-input" id="gwc-search-input" placeholder="Search city or zip code (e.g. Waukee, 50263)..." />
        <button class="gwc-search-btn" id="gwc-search-btn">Search</button>
      </div>

      <div id="gwc-geo-results"></div>

      <div id="gwc-weather-container">
        <div style="text-align: center; padding: 30px; color: var(--gwc-text-muted);">Loading weather data...</div>
      </div>
    </div>

    <div class="gwc-footer">
      <span style="font-size: 12px; color: var(--gwc-text-muted);">Temperature Unit</span>
      <div class="gwc-unit-toggle">
        <button class="gwc-unit-btn ${currentUnit === 'F' ? 'active' : ''}" id="gwc-unit-f">°F</button>
        <button class="gwc-unit-btn ${currentUnit === 'C' ? 'active' : ''}" id="gwc-unit-c">°C</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // Toggle Events
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      renderWeather();
    }
  });

  document.getElementById('gwc-close-btn').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  // Unit Toggle Events
  document.getElementById('gwc-unit-f').addEventListener('click', () => {
    currentUnit = 'F';
    chrome.storage.sync.set({ gwc_unit: 'F' });
    updateUnitBtns();
    renderWeather();
  });

  document.getElementById('gwc-unit-c').addEventListener('click', () => {
    currentUnit = 'C';
    chrome.storage.sync.set({ gwc_unit: 'C' });
    updateUnitBtns();
    renderWeather();
  });

  function updateUnitBtns() {
    document.getElementById('gwc-unit-f').classList.toggle('active', currentUnit === 'F');
    document.getElementById('gwc-unit-c').classList.toggle('active', currentUnit === 'C');
  }

  // Search Event
  const searchInput = document.getElementById('gwc-search-input');
  const searchBtn = document.getElementById('gwc-search-btn');

  searchBtn.addEventListener('click', () => doSearch());
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  async function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    searchBtn.innerText = 'Searching...';
    clearGeoResults();
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (!res.ok) throw new Error(`Geocoding returned HTTP ${res.status}`);

      const json = await res.json();
      const results = json.results || [];
      if (results.length === 0) {
        showGeoMessage('No match for that search. Try a nearby city name (e.g. Urbandale, Des Moines).');
      } else if (results.length === 1) {
        selectCity(results[0]);
      } else {
        showGeoChoices(results);
      }
    } catch (e) {
      console.error('Geocoding error:', e);
      showGeoMessage('Location search failed. Please check your connection and try again.');
    } finally {
      searchBtn.innerText = 'Search';
    }
  }

  function formatPlace(item) {
    return [item.name, item.admin1, item.country].filter(Boolean).join(', ');
  }

  function selectCity(item) {
    currentCity = {
      name: item.name,
      lat: item.latitude,
      lng: item.longitude,
      full: formatPlace(item)
    };
    chrome.storage.sync.set({ gwc_saved_city: currentCity });
    clearGeoResults();
    renderWeather();
  }

  function clearGeoResults() {
    const box = document.getElementById('gwc-geo-results');
    if (box) box.innerHTML = '';
  }

  function showGeoMessage(msg) {
    const box = document.getElementById('gwc-geo-results');
    if (box) box.innerHTML = `<div class="gwc-geo-msg">${escapeHtml(msg)}</div>`;
  }

  // Most city names and ZIP codes match more than one place, so let the user
  // pick instead of silently forecasting for whichever hit came back first.
  function showGeoChoices(results) {
    const box = document.getElementById('gwc-geo-results');
    if (!box) return;
    box.innerHTML = `<div class="gwc-geo-msg">Did you mean:</div>` + results.map((item, i) => `
      <button class="gwc-geo-option" data-idx="${i}">
        <span>${escapeHtml(formatPlace(item))}</span>
        <span class="gwc-geo-coords">${item.latitude.toFixed(2)}, ${item.longitude.toFixed(2)}</span>
      </button>
    `).join('');
    box.querySelectorAll('.gwc-geo-option').forEach((btn) => {
      btn.addEventListener('click', () => selectCity(results[Number(btn.dataset.idx)]));
    });
  }

  // WMO Code Interpreter
  function getWmoDescription(code) {
    const wmo = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
      80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return wmo[code] !== undefined ? wmo[code] : 'Partly cloudy';
  }

  // Open-Meteo is asked for values in the user's selected unit system, so nothing
  // is converted on display. The phrase helpers below still reason in metric and
  // normalize back explicitly.
  function apiUnits() {
    return currentUnit === 'F'
      ? { temperature: 'fahrenheit', wind: 'mph', precipitation: 'inch' }
      : { temperature: 'celsius', wind: 'kmh', precipitation: 'mm' };
  }

  function windLabel() {
    return currentUnit === 'F' ? 'mph' : 'km/h';
  }

  function precipLabel() {
    return currentUnit === 'F' ? 'in' : 'mm';
  }

  function toCelsius(temp) {
    return currentUnit === 'F' ? (temp - 32) * 5 / 9 : temp;
  }

  function toKmh(windSpeed) {
    return currentUnit === 'F' ? windSpeed * 1.609344 : windSpeed;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function formatTemp(temp) {
    if (temp === null || temp === undefined || Number.isNaN(Number(temp))) return '--°';
    return Math.round(Number(temp)) + (currentUnit === 'F' ? '°F' : '°C');
  }

  // Maps a WMO description into a natural, descriptive sky phrase (e.g. "sunny", "breezy")
  function getSkyPhrase(desc) {
    const phrases = {
      'Clear sky': 'sunny',
      'Mainly clear': 'mostly sunny',
      'Partly cloudy': 'partly cloudy',
      'Overcast': 'cloudy',
      'Foggy': 'foggy',
      'Depositing rime fog': 'foggy',
      'Light drizzle': 'lightly drizzling',
      'Moderate drizzle': 'drizzly',
      'Dense drizzle': 'drizzly',
      'Slight rain': 'lightly rainy',
      'Moderate rain': 'rainy',
      'Heavy rain': 'heavily rainy',
      'Slight snow fall': 'lightly snowing',
      'Moderate snow fall': 'snowy',
      'Heavy snow fall': 'heavily snowing',
      'Slight rain showers': 'showery',
      'Moderate rain showers': 'showery',
      'Violent rain showers': 'stormy',
      'Thunderstorm': 'stormy',
      'Thunderstorm with slight hail': 'stormy with hail',
      'Thunderstorm with heavy hail': 'stormy with heavy hail'
    };
    return phrases[desc] || desc.toLowerCase();
  }

  function getWindPhrase(windSpeedKmh) {
    if (windSpeedKmh < 8) return 'calm';
    if (windSpeedKmh < 24) return 'breezy';
    if (windSpeedKmh < 40) return 'windy';
    return 'very windy';
  }

  function getTempPhrase(tempC) {
    if (tempC < 0) return 'freezing';
    if (tempC < 10) return 'cold';
    if (tempC < 18) return 'cool';
    if (tempC < 26) return 'mild';
    if (tempC < 32) return 'warm';
    return 'hot';
  }

  // Builds a natural-language weather summary from live conditions (e.g. "Sunny and breezy, with mild temperatures today.")
  function getWeatherSummary(temp, desc, windSpeed, precip) {
    const sky = getSkyPhrase(desc);
    const windWord = getWindPhrase(toKmh(windSpeed));
    const tempWord = getTempPhrase(toCelsius(temp));
    const skyCapitalized = sky.charAt(0).toUpperCase() + sky.slice(1);

    let summary = `${skyCapitalized} and ${windWord}, with ${tempWord} temperatures today.`;
    if (precip && precip > 0) {
      summary += ' Precipitation is falling right now, so keep an umbrella handy.';
    }
    return summary;
  }

  // Initialize Native Leaflet Radar Map with maxNativeZoom: 6 (strictly avoids RainViewer z>=7 warning tiles)
  function initRadarMap(lat, lng) {
    setTimeout(() => {
      const mapContainer = document.getElementById('gwc-radar-map');
      if (!mapContainer || typeof L === 'undefined') return;

      if (window.gwcLeafletMap) {
        try { window.gwcLeafletMap.remove(); } catch (e) {}
      }

      const map = L.map('gwc-radar-map', {
        center: [lat, lng],
        zoom: 6,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: true,
        attributionControl: true
      });
      window.gwcLeafletMap = map;

      // Base CartoDB OpenStreetMap tiles
      // CARTO's anonymous basemap tiles now require an API key (basemaps.cartocdn.com
      // started watermarking "MAP KEY REQUIRED"); OSM's standard tile server is still
      // free and keyless, at the cost of requiring attribution per its usage policy.
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 2,
        maxZoom: 19,
        subdomains: 'abc',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // RainViewer Live Radar overlay (maxNativeZoom: 6 clamps RainViewer requests to level 6 and scales tiles smoothly)
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then(res => res.json())
        .then(data => {
          if (data.radar && data.radar.past && data.radar.past.length > 0) {
            const latest = data.radar.past[data.radar.past.length - 1];
            const tileUrl = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
            L.tileLayer(tileUrl, {
              opacity: 0.75,
              tileSize: 256,
              minZoom: 2,
              maxNativeZoom: 6,
              maxZoom: 16
            }).addTo(map);
          }
        })
        .catch(err => console.error("RainViewer tile load error:", err));

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 300);
    }, 150);
  }

  // Render Weather Card
  async function renderWeather() {
    const container = document.getElementById('gwc-weather-container');
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--gwc-text-muted);">Fetching forecast for ${escapeHtml(currentCity.name)}...</div>`;

    try {
      const units = apiUnits();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(currentCity.lat)}&longitude=${encodeURIComponent(currentCity.lng)}`
        + `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
        + `&temperature_unit=${units.temperature}&wind_speed_unit=${units.wind}`
        + `&precipitation_unit=${units.precipitation}&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo returned HTTP ${res.status}`);

      const data = await res.json();
      // Never substitute placeholder readings for missing data: a made-up
      // temperature is indistinguishable from a real one on screen.
      if (data.error) throw new Error(data.reason || 'Open-Meteo reported an error');
      if (!data.current || typeof data.current.temperature_2m !== 'number') {
        throw new Error('Response is missing current conditions');
      }
      if (!data.daily || !Array.isArray(data.daily.time)) {
        throw new Error('Response is missing the daily forecast');
      }

      const currTemp = data.current.temperature_2m;
      const currCode = data.current.weather_code;
      const currDesc = getWmoDescription(currCode);
      const humidity = data.current.relative_humidity_2m;
      const wind = Math.round(data.current.wind_speed_10m);
      const precip = data.current.precipitation;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      let forecastHtml = "";
      if (data.daily && data.daily.time) {
        for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
          const dStr = data.daily.time[i];
          const dt = new Date(dStr + "T00:00:00");
          const dayName = i === 0 ? "Today" : dayNames[dt.getDay()];
          const maxT = formatTemp(data.daily.temperature_2m_max[i]);
          const minT = formatTemp(data.daily.temperature_2m_min[i]);
          const desc = getWmoDescription(data.daily.weather_code ? data.daily.weather_code[i] : 2);
          const rain = data.daily.precipitation_probability_max
            ? (data.daily.precipitation_probability_max[i] || 0)
            : 0;

          forecastHtml += `
            <div class="gwc-forecast-item">
              <span class="gwc-day-name">${dayName}</span>
              <span class="gwc-day-desc">${desc} (${rain}% rain)</span>
              <span class="gwc-day-temps">${maxT} / ${minT}</span>
            </div>
          `;
        }
      }

      const weatherSummary = getWeatherSummary(currTemp, currDesc, wind, precip);

      container.innerHTML = `
        <div class="gwc-weather-card">
          <div class="gwc-location-name">📍 ${escapeHtml(currentCity.full || currentCity.name)}</div>
          <div class="gwc-hero-temp-row">
            <div>
              <div class="gwc-main-temp">${formatTemp(currTemp)}</div>
              <div class="gwc-weather-desc">${currDesc}</div>
            </div>
          </div>
          <div class="gwc-details-grid">
            <div class="gwc-detail-item">
              <span class="gwc-detail-label">Humidity</span>
              <span class="gwc-detail-value">${humidity}%</span>
            </div>
            <div class="gwc-detail-item">
              <span class="gwc-detail-label">Wind</span>
              <span class="gwc-detail-value">${wind} ${windLabel()}</span>
            </div>
            <div class="gwc-detail-item">
              <span class="gwc-detail-label">Precip</span>
              <span class="gwc-detail-value">${precip} ${precipLabel()}</span>
            </div>
          </div>
        </div>

        <div class="gwc-radar-card">
          <div class="gwc-radar-header">
            <span>📡 Live Doppler Radar</span>
            <span style="font-size: 11px; font-weight: 500; color: var(--gwc-text-muted);">${escapeHtml(currentCity.name)} Area</span>
          </div>
          <div id="gwc-radar-map" class="gwc-radar-map-div"></div>
        </div>

        <div class="gwc-packing-card">
          <div class="gwc-packing-icon">✨</div>
          <div class="gwc-packing-content">
            <div class="gwc-packing-title">AI Weather Summary</div>
            <div class="gwc-packing-text">${weatherSummary}</div>
          </div>
        </div>

        <div>
          <div class="gwc-section-title">7-Day Forecast</div>
          <div class="gwc-forecast-list">${forecastHtml}</div>
        </div>
      `;

      initRadarMap(currentCity.lat, currentCity.lng);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      container.innerHTML = `
        <div style="color: #ef4444; padding: 20px; text-align: center;">
          <div style="font-weight: 600; margin-bottom: 6px;">Couldn't load weather data.</div>
          <div style="font-size: 12px;">${escapeHtml(err && err.message ? err.message : 'Please check your connection.')}</div>
        </div>
      `;
    }
  }

})();
