/**
 * Gmail Weather Companion - Extension Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const CITY_DB = [
    { name: "Waukee", lat: 41.6119, lng: -93.8858, full: "Waukee, IA 50263, USA" },
    { name: "Des Moines", lat: 41.6005, lng: -93.6091, full: "Des Moines, IA, USA" },
    { name: "Austin", lat: 30.2672, lng: -97.7431, full: "Austin, TX, USA" },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503, full: "Tokyo, Japan" },
    { name: "London", lat: 51.5074, lng: -0.1278, full: "London, UK" },
    { name: "Paris", lat: 48.8566, lng: 2.3522, full: "Paris, France" }
  ];

  const stored = await chrome.storage.sync.get(['gwc_unit', 'gwc_saved_city']);
  let currentUnit = stored.gwc_unit || 'F';
  let currentCity = stored.gwc_saved_city || CITY_DB[0];

  updateUnitBtns();
  renderWeather();

  // Unit Toggles
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

  // Search Action
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
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        const item = json.results[0];
        const full = item.name + (item.admin1 ? `, ${item.admin1}` : '') + `, ${item.country || ''}`;
        currentCity = { name: item.name, lat: item.latitude, lng: item.longitude, full: full };
        chrome.storage.sync.set({ gwc_saved_city: currentCity });
        renderWeather();
      } else {
        alert('City/Zip not found. Please try another search.');
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    } finally {
      searchBtn.innerText = 'Search';
    }
  }

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

  function formatTemp(tempC) {
    if (currentUnit === 'F') {
      return Math.round((tempC * 9 / 5) + 32) + '°F';
    }
    return Math.round(tempC) + '°C';
  }

  function getPackingAdvice(tempC, desc) {
    let advice = "";
    if (tempC < 10) advice = "Bring a warm winter coat, scarf, gloves, and insulated layers.";
    else if (tempC < 18) advice = "Pack a lightweight jacket or cardigan with jeans and comfortable walking shoes.";
    else if (tempC > 28) advice = "Pack breathable cotton clothing, sunglasses, sunscreen, and stay hydrated!";
    else advice = "Pleasant weather expected. Pack casual layers, t-shirts, and light outerwear.";

    if (desc && (desc.toLowerCase().includes('rain') || desc.toLowerCase().includes('drizzle') || desc.toLowerCase().includes('thunderstorm'))) {
      advice += " ☔ Don't forget an umbrella or rain jacket!";
    }
    return advice;
  }

  function initRadarMap(lat, lng) {
    setTimeout(() => {
      const mapContainer = document.getElementById('gwc-radar-map');
      if (!mapContainer || typeof L === 'undefined') return;

      if (window.gwcLeafletMapPopup) {
        try { window.gwcLeafletMapPopup.remove(); } catch (e) {}
      }

      const map = L.map('gwc-radar-map', {
        center: [lat, lng],
        zoom: 6,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: true,
        attributionControl: false
      });
      window.gwcLeafletMapPopup = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        minZoom: 2,
        maxZoom: 16,
        subdomains: 'abcd'
      }).addTo(map);

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
        .catch(err => console.error("RainViewer tile error:", err));

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 300);
    }, 150);
  }

  async function renderWeather() {
    const container = document.getElementById('gwc-weather-container');
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--gwc-text-muted);">Fetching forecast for ${currentCity.name}...</div>`;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentCity.lat}&longitude=${currentCity.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      const currTemp = data.current ? data.current.temperature_2m : 20;
      const currCode = data.current ? data.current.weather_code : 2;
      const currDesc = getWmoDescription(currCode);
      const humidity = data.current ? data.current.relative_humidity_2m : 50;
      const wind = data.current ? Math.round(data.current.wind_speed_10m) : 10;
      const precip = data.current ? data.current.precipitation : 0;

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
          const rain = data.daily.precipitation_probability_max[i] || 0;

          forecastHtml += `
            <div class="gwc-forecast-item">
              <span class="gwc-day-name">${dayName}</span>
              <span class="gwc-day-desc">${desc} (${rain}% rain)</span>
              <span class="gwc-day-temps">${maxT} / ${minT}</span>
            </div>
          `;
        }
      }

      const packingTip = getPackingAdvice(currTemp, currDesc);

      container.innerHTML = `
        <div class="gwc-weather-card">
          <div class="gwc-location-name">📍 ${currentCity.full || currentCity.name}</div>
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
              <span class="gwc-detail-value">${wind} km/h</span>
            </div>
            <div class="gwc-detail-item">
              <span class="gwc-detail-label">Precip</span>
              <span class="gwc-detail-value">${precip} mm</span>
            </div>
          </div>
        </div>

        <div class="gwc-radar-card">
          <div class="gwc-radar-header">
            <span>📡 Live Doppler Radar</span>
            <span style="font-size: 11px; font-weight: 500; color: var(--gwc-text-muted);">${currentCity.name} Area</span>
          </div>
          <div id="gwc-radar-map" class="gwc-radar-map-div"></div>
        </div>

        <div class="gwc-packing-card">
          <div class="gwc-packing-icon">🧳</div>
          <div class="gwc-packing-content">
            <div class="gwc-packing-title">Smart Packing Tip</div>
            <div class="gwc-packing-text">${packingTip}</div>
          </div>
        </div>

        <div>
          <div class="gwc-section-title">7-Day Forecast</div>
          <div class="gwc-forecast-list">${forecastHtml}</div>
        </div>
      `;

      initRadarMap(currentCity.lat, currentCity.lng);
    } catch (err) {
      console.error("Weather fetch error:", err);
      container.innerHTML = `<div style="color: #ef4444; padding: 20px; text-align: center;">Error loading weather. Check internet connection.</div>`;
    }
  }
});
