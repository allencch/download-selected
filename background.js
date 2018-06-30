const getFileExtension = (url) => {
  const matches = url.match(/\.(\w+)\b/g);
  if (!matches) {
    return null;
  }
  const lastMatch = matches[matches.length - 1];
  return lastMatch.substring(1);
};

const downloadFile = (zip, link) => {
  return new Promise((resolve, reject) => {
    fetch(link.url, {
      referrer: link.referrer
    }).then(response => {
      if (response.ok) {
        const name = `${link.text}.${getFileExtension(link.url)}`;
        return response
          .blob()
          .then(blob => zip.file(name, blob))
          .then(resolve);
      }
      else {
        reject(Error(`Fail download ${link.url}`));
        return null;
      }
    });
  });
};

const createDownload = (data) => {
  const { links } = data;
  if (!links || !links.length) {
    return;
  }

  const zip = new JSZip();
  const promises = links.map(link => (downloadFile(zip, link)));
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
