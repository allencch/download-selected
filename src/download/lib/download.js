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

  const downloadFile = (link) => {
    return new Promise((resolve, reject) => {
      return fetch(link.url, {
        referrer: link.referrer
      }).then(response => {
        if (response.ok) {
          const name = `${link.text}.${getFileExtension(link.url)}`;
          return response
            .arrayBuffer()
            .then(data => {
              resolve({
                ...link,
                name,
                data
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

  const createZip = (fetchedData) => {
    const zip = JSZip();

    for (let i = 0; i < fetchedData.length; i++) {
      const link = fetchedData[i];
      zip.file(link.name, link.data);
    }

    const result = zip.generateAsync({ type: 'blob' });
    writeToDiv('Zipping...');
    result.then(content => {
      writeToDiv('Done');

      // Use FileSaver.saveAs. Firefox is not able to
      // download from blob: protocol
      window.saveAs(content, 'download.zip');
    }).catch(err => {
      writeToDiv(`Error: ${err}`);
      console.log(err);
    });
  };

  const recursiveFetch = (fetchedData = [], links, count) => {
    if (count >= links.length) {
      writeToDiv('Finish');
      createZip(fetchedData);
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
