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

/*******************
* Zip once
*******************/

const zipFetched = (zip, link) => {
  return new Promise((resolve, reject) => {
    return fetch(link.base64data)
      .then(response => {
        if (response.ok) {
          return response
            .blob()
            .then(blob => zip.file(link.name, blob))
            .then(zipData => resolve(zipData));
        }
        else {
          reject(Error(`Fail fetch base64 ${link.url}`));
          return null;
        }
      });
  });
};

const zipAll = request => {
  const zip = JSZip();
  const { fetchedData } = request;
  const promises = fetchedData.map(link => zipFetched(zip, link));
  Promise.all(promises).then(() => {
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
  });
};

browser.runtime.onMessage.addListener((request) => {
  switch (request.cmd) {
    case 'zip-all':
      zipAll(request);
      break;
  }
});
