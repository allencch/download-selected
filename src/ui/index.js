/* global chrome */
var browser = browser || chrome;

// Main
(() => {
  const { DS } = window;

  browser.runtime.onMessage.addListener((message, sender, reply) => {
    switch (message.type) {
      case 'WRITE_MESSAGE':
        DS.writeToDiv(message.message);
    }
  });

  DS.createUI();
  const selection = window.getSelection();
  const links = DS.extractLinks(selection);

  if (links.length === 0) return;

  browser.runtime.sendMessage({
    type: 'DOWNLOAD',
    data: {
      links
    }
  });
})();
