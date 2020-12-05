/* global chrome */
var browser = browser || chrome;

const getSelection = (tab) => {
  browser.tabs.executeScript(tab.id, {
    file: 'ui.js'
  });
};

const download = (links, tabId) => {
  const { DSB } = window;
  DSB.recursiveFetch([], links, 0, { tabId });
};

browser.contextMenus.create({
  id: "download-selected",
  title: "Download Selected",
  contexts: ["all"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'download-selected':
      getSelection(tab);
      break;
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    case 'DOWNLOAD': {
      const { links } = message.data;
      download(links, sender.tab.id);
    }
  }
});
