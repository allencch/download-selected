(() => {
  const NUM_JOB = 2;
  var browser = browser || chrome;

  // Setup
  window.DS = window.DS || {};
  const { DS } = window;

  /**************
   * Downloads
   **************/

  const writeToDiv = message => {
    const div = document.querySelector('.download-selected--content');
    if (!div) {
      return;
    }
    const child = document.createElement('div');
    const text = document.createTextNode(message);
    child.appendChild(text);
    div.appendChild(child);
  };

  const extractLinks = selection => {
    const children = DS.getChildren(selection);
    return children
      .filter(el => el.text && el.href.match(/(jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico|pdf|txt)/i))
      .map(el => ({
        text: el.text,
        url: el.href,
        referrer: window.location.toString()
      }));
  };

  const getFileExtension = (url) => {
    const matches = url.match(/\.(\w+)\b/g);
    if (!matches) {
      return null;
    }
    const lastMatch = matches[matches.length - 1];
    return lastMatch.substring(1);
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const downloadFile = (link) => {
    return new Promise((resolve, reject) => {
      return fetch(link.url, {
        referrer: link.referrer
      }).then(response => {
        if (response.ok) {
          const name = `${link.text}.${getFileExtension(link.url)}`;
          return response
            .blob()
            .then(blob => blobToBase64(blob))
            .then(base64data => {
              resolve({
                ...link,
                name,
                base64data
              });
            });
        }
        else {
          const message = `Fail download ${link.url}`;
          writeToDiv(message);
          return reject(Error(message));
        }
      });
    });
  };

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

  const zipAll = fetchedData => {
    const zip = JSZip();
    const promises = fetchedData.map(link => zipFetched(zip, link));
    Promise.all(promises).then(() => {
      zip.generateAsync({ type: "blob" })
        .then(content => {
          const url = URL.createObjectURL(content);
          browser.runtime.sendMessage({
            cmd: 'download',
            url
          });
        });
    });
    // const blob = new Blob([JSON.stringify(fetchedData)]);
    // const url = URL.createObjectURL(blob);
    // browser.runtime.sendMessage({
    //   cmd: 'zip-all',
    //   blobUrl: url
    // });
  };

  const recursiveFetch = (fetchedData = [], links, count) => {
    if (count >= links.length) {
      writeToDiv('finish');
      zipAll(fetchedData);
      return;
    }
    const two = links.slice(count, count + NUM_JOB);
    const promises = two.map(link => downloadFile(link));
    Promise.all(promises).then(list => {
      list.forEach(link => {
        writeToDiv(`${link.text} downloaded`);
        fetchedData.push(link);
      });
      recursiveFetch(fetchedData, links, count + NUM_JOB);
    });
  };

  DS.extractLinks = extractLinks;
  DS.recursiveFetch = recursiveFetch;
})();
