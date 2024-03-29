/* global chrome */
var browser = browser || chrome;
import { recursiveFetch } from './background/lib/download.js';

const getSelection = (tab) => {
  browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['ui.js']
  });
};

const download = (links, tabId) => {
  recursiveFetch([], links, 0, { tabId });
};

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

browser.action.onClicked.addListener((tab) => {
  getSelection(tab);
});

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "download-selected",
    title: "Download Selected",
    contexts: ["all"]
  });
});
