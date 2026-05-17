function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'searchImageForText',
      title: chrome.i18n.getMessage('contextMenuTitle'),
      contexts: ['selection']
    });
  });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchImageForText' && info.selectionText) {
    chrome.storage.local.set({ pendingSearchText: info.selectionText.trim() }, () => {
      chrome.action.openPopup();
    });
  }
});
