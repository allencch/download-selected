/* global chrome */
var browser = browser || chrome;

const getSelection = (tab) => {
  browser.tabs.executeScript(tab.id, {
    file: 'ui.js'
  });
};

const download = (links) => {
  const { DSB } = window;
  DSB.recursiveFetch([], links, 0);
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

browser.runtime.onMessage.addListener((request) => {
  switch (request.cmd) {
    case 'DOWNLOAD': {
      const { links } = request.data;
      download(links);
    }
  }
});
