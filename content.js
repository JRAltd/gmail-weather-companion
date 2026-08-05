// Gmail Weather Companion - Content Script
(function () {
  'use strict';

  console.log('🌤️ Gmail Weather Companion extension initialized.');

  let sidebarElement = null;
  let currentSubject = '';
  let lastAnalyzedBody = '';

  // Get API Server Base URL from storage or fallback to production Cloud Run / Local
  async function getApiBaseUrl() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiServerUrl'], (result) => {
        resolve(result.apiServerUrl || window.location.origin);
      });
    });
  }

  // Create or retrieve side panel container in Gmail DOM
  function injectSidebarContainer() {
    if (document.getElementById('gwc-weather-sidebar')) {
      return document.getElementById('gwc-weather-sidebar');
    }

    const sidebar = document.createElement('div');
    sidebar.id = 'gwc-weather-sidebar';
    sidebar.className = 'gwc-sidebar-docked';
    sidebar.innerHTML = `
      <div class="gwc-header">
        <div class="gwc-brand">
          <span class="gwc-icon">🌤️</span>
          <span class="gwc-title">Weather Companion</span>
        </div>
        <button id="gwc-close-btn" class="gwc-icon-btn" title="Close Panel">✕</button>
      </div>
      <div id="gwc-content" class="gwc-body">
        <div class="gwc-placeholder">
          <p>Open an email with travel plans, event locations, or flight details to see weather intelligence!</p>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);

    document.getElementById('gwc-close-btn').addEventListener('click', () => {
      sidebar.classList.toggle('gwc-hidden');
    });

    return sidebar;
  }

  // Detect currently opened email in Gmail
  function detectOpenEmail() {
    const subjectNode = document.querySelector('h2.hP');
    const bodyNodes = document.querySelectorAll('div.a3s.aiL, div[role="listitem"] div.a3s');

    if (!subjectNode || bodyNodes.length === 0) return null;

    const subject = subjectNode.innerText || '';
    let bodyText = '';
    bodyNodes.forEach((node) => {
      bodyText += node.innerText + '\n';
    });

    return { subject, bodyText };
  }

  // Request weather analysis from backend API
  async function analyzeEmailAndFetchWeather(subject, bodyText) {
    const sidebar = injectSidebarContainer();
    const contentArea = document.getElementById('gwc-content');
    contentArea.innerHTML = `
      <div class="gwc-loading">
        <div class="gwc-spinner"></div>
        <p>Analyzing email location with Gemini AI...</p>
      </div>
    `;

    try {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyText })
      });

      if (!response.ok) throw new Error('Failed to analyze email');

      const data = await response.json();
      renderWeatherCard(data);
    } catch (err) {
      console.error('Weather analysis error:', err);
      contentArea.innerHTML = `
        <div class="gwc-error">
          <p>Unable to load weather forecast.</p>
          <small>Make sure the API server is running.</small>
        </div>
      `;
    }
  }

  // Render weather UI card inside injected Gmail sidebar
  function renderWeatherCard(data) {
    const contentArea = document.getElementById('gwc-content');
    const weather = data.weather;
    const ai = data.analysis;

    if (!weather) {
      contentArea.innerHTML = `<div class="gwc-placeholder"><p>No location detected in this email.</p></div>`;
      return;
    }

    contentArea.innerHTML = `
      <div class="gwc-card">
        <div class="gwc-location">
          <h3>${weather.location.name}, ${weather.location.country}</h3>
          <span class="gwc-temp">${weather.current.temperature}°C</span>
        </div>
        <div class="gwc-condition">
          <span>${weather.current.weatherDescription}</span>
          <span>Wind: ${weather.current.windSpeed} km/h</span>
        </div>
        ${ai ? `
          <div class="gwc-ai-box">
            <div class="gwc-ai-title">✨ Gemini Weather Summary</div>
            <p>${ai.summary}</p>
            <div class="gwc-tip">💡 <strong>Outfit:</strong> ${ai.outfitRecommendation}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Observer loop to monitor email navigation in Gmail Single Page App
  setInterval(() => {
    const email = detectOpenEmail();
    if (email && email.subject !== currentSubject) {
      currentSubject = email.subject;
      analyzeEmailAndFetchWeather(email.subject, email.bodyText);
    }
  }, 2000);

})();