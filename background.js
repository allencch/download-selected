const createDownload = (data) => {
  const { links } = data;
  if (!links || !links.length) {
    return;
  }

  const zip = new JSZip();
  zip.file(links[0].href);
  zip.generateAsync({ type: "blob" })
    .then(content => {
      const url = URL.createObjectURL(content);
      browser.downloads.download({
        url,
        filename: 'download.zip',
        conflictAction: 'uniquify',
        saveAs: true
      });
    });
};

const getSelection = (tab) => {
  browser.tabs.executeScript(tab.id, {
    file: 'download.js'
  });
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

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.cmd) {
    case 'create-download':
      createDownload(request);
  }
});
