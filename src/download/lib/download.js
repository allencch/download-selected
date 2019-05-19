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

  const zipFile = (zip, link) => {
    return new Promise(resolve => {
      zip.file(link.name, link.data);
      resolve(zip);
    });
  };

  const createZip = (fetchedData) => {
    const zip = JSZip();

    for (let i = 0; i < fetchedData.length; i++) {
      const link = fetchedData[i];
      console.log(link);
      zip.file(link.name, link.data);
    }


    const result = zip.generateAsync({ type: 'blob' });
    console.log(zip, result);
    result.then(content => {
      console.log(content);
      window.saveAs(content, 'download.zip'); // From FileSaver
    }).catch(err => {
      console.log(err);
    }).finally(result => {
      console.log(result);
    });
    
    // const promises = fetchedData.map(link => zipFile(zip, link));
    // Promise.all(promises).then(() => {
    //   writeToDiv('Compressing...');
    //   const result = zip.generateAsync({ type: "blob" });
    //   console.log(result);
    //   result.then(content => {
    //     // const url = URL.createObjectURL(content);

    //     writeToDiv('Done');
    //     // browser.runtime.sendMessage({
    //     //   cmd: 'download',
    //     //   url
    //     // });
    //     window.saveAs(content, 'download.zip'); // From FileSaver
    //   });
    // });
  };

  const recursiveFetch = (fetchedData = [], links, count) => {
    if (count >= links.length) {
      writeToDiv('finish');
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
