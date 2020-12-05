/* global chrome */
var browser = browser || chrome;

// Main
(() => {
  const { DS } = window;
  DS.createUI();
  const selection = window.getSelection();
  const links = DS.extractLinks(selection);

  if (links.length === 0) return;

  browser.runtime.sendMessage({
    cmd: 'DOWNLOAD',
    data: {
      links
    }
  });
})();
