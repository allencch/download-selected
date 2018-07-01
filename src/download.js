(() => {
  const NUM_JOB = 2;
  var browser = browser || chrome;

  /**********
  * Get links
  ***********/

  const getLinkNode = node => {
    if (!node) {
      return null;
    }
    let nodeOfInterest = node;
    if (nodeOfInterest.nodeName === '#text') {
      nodeOfInterest = nodeOfInterest.parentNode;
    }
    if (nodeOfInterest.nodeName !== 'A') {
      nodeOfInterest = node.previousSibling;
    }
    if (nodeOfInterest.nodeName !== 'A') {
      nodeOfInterest = node.nextSibling;
    }
    if (nodeOfInterest.nodeName === 'A' &&
        !nodeOfInterest.attributes.href.value.match(/^javascript/)) {
      return nodeOfInterest;
    }
    return null;
  };

  const isLink = node => {
    return Boolean(getLinkNode(node));
  };

  const getFirstNode = selection => {
    let node = getLinkNode(selection.getRangeAt(0).startContainer);
    if (!node) {
      node = getLinkNode(selection.getRangeAt(0).startContainer.nextSibling);
    }
    return node;
  };

  const getLastNode = selection => {
    let node = getLinkNode(selection.getRangeAt(0).endContainer);
    if (!node) {
      node = getLinkNode(selection.getRangeAt(0).endContainer.previousSibling);
    }
    return node;
  };

  const getChildren = selection => {
    let children = Array.from(selection.anchorNode.parentNode.children);
    if (!children.length) {
      children = Array.from(selection.anchorNode.parentNode.parentNode.children);
    }

    const firstNode = getFirstNode(selection);
    let firstIndex = 0;
    let lastIndex = children.length - 1;
    if (firstNode) {
      firstIndex = children.indexOf(firstNode);
    }

    const lastNode = getLastNode(selection);
    if (lastNode) {
      lastIndex = children.indexOf(lastNode);
    }
    return children.slice(firstIndex, lastIndex + 1);
  };

  /**************
  * Downloads
  **************/

  const extractLinks = selection => {
    const children = getChildren(selection);
    return children
      .filter(el => isLink(el))
      .map(el => ({
        text: el.innerHTML,
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
          reject(Error(`Fail download ${link.url}`));
          return null;
        }
      });
    });
  };

  const zipAll = fetchedData => {
    browser.runtime.sendMessage({
      cmd: 'zip-all',
      fetchedData
    });
  };

  const recursiveFetch = (fetchedData = [], links, count) => {
    if (count >= links.length) {
      console.log('finish');
      zipAll(fetchedData);
      return;
    }
    const two = links.slice(count, count + NUM_JOB);
    const promises = two.map(link => downloadFile(link));
    Promise.all(promises).then(list => {
      list.forEach(link => {
        console.log(`${link.text} downloaded`);
        fetchedData.push(link);
      });
      recursiveFetch(fetchedData, links, count + NUM_JOB);
    });
  };

  const selection = window.getSelection();
  const links = extractLinks(selection);
  recursiveFetch([], links, 0);
})();
