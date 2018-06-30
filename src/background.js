const NUM_JOB = 2;

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
    return fetch(link.url, {
      referrer: link.referrer
    }).then(response => {
      if (response.ok) {
        const name = `${link.text}.${getFileExtension(link.url)}`;
        return response
          .blob()
          .then(blob => zip.file(name, blob))
          .then(zipData => {
            resolve({ link, zipData });
          });
      }
      else {
        reject(Error(`Fail download ${link.url}`));
        return null;
      }
    });
  });
};

const recursiveFetch = (zip, links, count, tabId) => {
  if (count >= links.length) {
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
    return;
  }
  const two = links.slice(count, count + NUM_JOB);
  const promises = two.map(link => downloadFile(zip, link));
  Promise.all(promises).then(list => {
    list.forEach(({ link }) => {
      browser.tabs.sendMessage(tabId, {
        cmd: 'message',
        message: `${link.text} downloaded`
      });
    });
    recursiveFetch(zip, links, count + NUM_JOB, tabId);
  });
};

const createDownload = (data, tabId) => {
  const { links } = data;
  if (!links || !links.length) {
    return;
  }
  const zip = new JSZip();
  recursiveFetch(zip, links, 0, tabId);
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
      createDownload(request, sender.tab.id);
  }
});
