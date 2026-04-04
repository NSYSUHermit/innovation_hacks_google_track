// 嘗試設定點擊 icon 時開啟 Side Panel (較新版 Chrome 支援)
try {
  chrome.sidePanel.setPanelBehavior({ openPanelOnAction: true }).catch(() => {});
} catch (e) {
  console.warn('setPanelBehavior not supported or threw an error:', e);
}

// 備用方案：當點擊 Extension Icon 時手動開啟 Side Panel
chrome.action.onClicked.addListener((tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJD') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractJD' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // Keep message channel open
  } else if (request.action === 'autofill') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill', data: request.data }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
});
