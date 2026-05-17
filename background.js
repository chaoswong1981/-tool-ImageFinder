chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'searchImageForText',
    title: '搜索配图',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchImageForText' && info.selectionText) {
    chrome.storage.local.set({ pendingSearchText: info.selectionText.trim() }, () => {
      chrome.action.openPopup();
    });
  }
});
