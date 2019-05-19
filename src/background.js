var browser = browser || chrome;

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


const downloadZip = request => {
  const { url } = request;
  const downloadPromise = browser.downloads.download({
    url,
    filename: 'download.zip',
    conflictAction: 'uniquify',
    saveAs: true
  });

  // Firefox
  if (downloadPromise) {
    downloadPromise.then(() => {
      URL.revokeObjectURL(url);
    });
  }
};

browser.runtime.onMessage.addListener((request) => {
  switch (request.cmd) {
    case 'zip-all':
      zipAll(request);
      break;
    case 'download':
      console.log(request);
      downloadZip(request);
      break;
  }
});
