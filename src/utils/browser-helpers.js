export function getCurrentTabId (callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null)
  })
}

export function openUrlCurrentTab (url) {
  getCurrentTabId(tabId => {
    chrome.tabs.update(tabId, { url: url })
  })
}
