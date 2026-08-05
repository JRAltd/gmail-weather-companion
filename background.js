// Service Worker Background Script for Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🌤️ Gmail Weather Companion Extension Installed Successfully.');
  chrome.storage.sync.set({
    apiServerUrl: 'https://ais-dev-bjxjux6zj75jx7owqeifgu-232834219526.us-east5.run.app',
    tempUnit: 'C'
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_WEATHER') {
    fetch(request.url)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep response channel open async
  }
});