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



const zipAll = request => {
  const zip = JSZip();
  const { blobUrl } = request;
  console.log(blobUrl);

  // Cannot use fetch, because it only allows http or https
  const xhr = new XMLHttpRequest();
  xhr.open('GET', blobUrl, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    const blob = xhr.response;
    new Response(blob).text().then(text => {
      const fetchedData = JSON.parse(text);
      const promises = fetchedData.map(link => zipFetched(zip, link));
      Promise.all(promises).then(() => {
        zip.generateAsync({ type: "blob" })
          .then(content => {
            const url = URL.createObjectURL(content);
            console.log(url);
            const downloadPromise = browser.downloads.download({
              url,
              filename: 'download.zip',
              conflictAction: 'uniquify',
              saveAs: true
            }, () => {
              // Chrome
              URL.revokeObjectURL(url);
            });

            // Firefox
            if (downloadPromise) {
              downloadPromise.then(() => {
                console.log('there');
                URL.revokeObjectURL(url);
              });
            }
          });
        URL.revokeObjectURL(blobUrl);
      });
    });
  };
  xhr.send();

  // fetch(blobUrl).then(res => res.blob())
  //   .then(fetchedData => {
  //     console.log(fetchedData);
  //     const promises = fetchedData.map(link => zipFetched(zip, link));
  //     Promise.all(promises).then(() => {
  //       zip.generateAsync({ type: "blob" })
  //         .then(content => {
  //           const url = URL.createObjectURL(content);
  //           browser.downloads.download({
  //             url,
  //             filename: 'download.zip',
  //             conflictAction: 'uniquify',
  //             saveAs: true
  //           });
  //           URL.revokeObjectURL(url);
  //         });
  //     });

  //     URL.revokeObjectURL(blobUrl);
  //   });
};

const downloadZip = request => {
  const { url } = request;
  console.log(url);
  const downloadPromise = browser.downloads.download({
    url,
    filename: 'download.zip',
    conflictAction: 'uniquify',
    saveAs: true
  });

  // Firefox
  if (downloadPromise) {
    downloadPromise.then(() => {
      console.log('there');
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
      downloadZip(request);
      break;
  }
});
