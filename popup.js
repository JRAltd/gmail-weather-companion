document.addEventListener('DOMContentLoaded', () => {
  const serverInput = document.getElementById('serverUrl');
  const tempSelect = document.getElementById('tempUnit');
  const saveBtn = document.getElementById('saveBtn');

  chrome.storage.sync.get(['apiServerUrl', 'tempUnit'], (data) => {
    serverInput.value = data.apiServerUrl || window.location.origin;
    tempSelect.value = data.tempUnit || 'C';
  });

  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      apiServerUrl: serverInput.value,
      tempUnit: tempSelect.value
    }, () => {
      saveBtn.innerText = 'Saved ✓';
      setTimeout(() => { saveBtn.innerText = 'Save Settings'; }, 1500);
    });
  });
});