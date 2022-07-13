/* global chrome */
var browser = browser || chrome;

// Main
(() => {
  const { DS } = window;

  const base64ToBlob = (base64, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then(res => res.blob());

  browser.runtime.onMessage.addListener(async (message, sender, reply) => {
    switch (message.type) {
      case 'WRITE_MESSAGE':
        DS.writeToDiv(message.message);
        break;
      case 'SAVE_ZIP':
        window.saveAs(await base64ToBlob(message.data), 'download.zip');
        break;
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
