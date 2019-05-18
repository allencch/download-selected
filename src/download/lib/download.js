(() => {
  const NUM_JOB = 2;
  var browser = browser || chrome;

  // Setup
  window.DS = window.DS || {};
  const { DS } = window;

  /***********
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
    if (nodeOfInterest && nodeOfInterest.nodeName !== 'A') {
      nodeOfInterest = node.nextSibling;
    }
    if (nodeOfInterest && nodeOfInterest.nodeName === 'A' &&
        !(/^javascript/.test(nodeOfInterest.attributes.href.value)) &&
        !(/^#/.test(nodeOfInterest.attributes.href.value))) {
      return nodeOfInterest;
    }
    return null;
  };

  const recursiveNextLink = (startContainer, endContainer) => {
    if (!startContainer || startContainer === endContainer) {
      return null;
    }
    let node = getLinkNode(startContainer);

    if (node) {
      return node;
    }
    else if (startContainer.fistChild) {
      return recursiveNextLink(startContainer.fistChild, endContainer);
    }
    else if (startContainer.nextSibling) {
      return recursiveNextLink(startContainer.nextSibling, endContainer);
    }
    return null;
  };

  const getFirstNode = selection => {
    const node = recursiveNextLink(selection.getRangeAt(0).startContainer, selection.getRangeAt(0).endContainer);
    return node;
  };

  const recursivePreviousLink = (startContainer, endContainer) => {
    if (!endContainer || endContainer === startContainer) {
      return null;
    }
    let node = getLinkNode(endContainer);

    if (node) {
      return node;
    }
    else if (endContainer.previousSibling && endContainer.previousSibling.lastChild) {
      return recursivePreviousLink(startContainer, endContainer.previousSibling.lastChild);
    }
    else if (endContainer.previousSibling) {
      return recursivePreviousLink(startContainer, endContainer.previousSibling);
    }
    else if (endContainer.parentNode) {
      return recursivePreviousLink(startContainer, endContainer.parentNode);
    }
    return null;
  };

  const getLastNode = selection => {
    const node = recursivePreviousLink(selection.getRangeAt(0).startContainer, selection.getRangeAt(0).endContainer);
    return node;
  };

  const getAncestors = node => {
    const ancestors = [];
    if (!node) {
      return ancestors;
    }
    let parentNode = node.parentNode;
    while (parentNode) {
      ancestors.push(parentNode);
      parentNode = parentNode.parentNode;
    }
    return ancestors;
  };

  const getCommonAncestor = selection => {
    return selection.getRangeAt(0).commonAncestorContainer;
  };

  const getChildren = selection => {
    const ancestor = getCommonAncestor(selection);
    let children = Array.from(ancestor.querySelectorAll('a[href]:not([href^=javascript]'));

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

  /********
   * UI
   *********/

  const onClickDownloadSelectedClose = () => {
    return () => {
      const div = document.querySelector('#download-selected');
      if (div) {
        div.remove();
      }
    };
  };

  const createMain = () => {
    let div = document.querySelector('#download-selected');
    if (div) {
      div.remove();
    }
    const body = document.querySelector('body');
    div = document.createElement('div');
    div.setAttribute('id', 'download-selected');
    div.setAttribute('style', `
      position: fixed;
      top: 10px;
      left: 10px;
      width: 100px;
      height: 100px;
      z-index: 1000;
      overflow: auto;
      background: white;
      border: 1px solid black;
    `);

    const closeDiv = document.createElement('div');
    closeDiv.setAttribute('class', 'download-selected--close');
    closeDiv.setAttribute('style', 'position:absolute;top:5px;right:5px;cursor:pointer');
    closeDiv.setAttribute('onclick',`(${onClickDownloadSelectedClose()})()`);
    closeDiv.appendChild(document.createTextNode('X'));
    div.appendChild(closeDiv);

    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', 'download-selected--content');
    contentDiv.setAttribute('style', 'font-size:8px;white-space:nowrap');
    div.appendChild(contentDiv);

    body.appendChild(div);
  };

  const createUI = () => {
    createMain();
  };


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
    const children = getChildren(selection);
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

  const zipAll = fetchedData => {
    browser.runtime.sendMessage({
      cmd: 'zip-all',
      fetchedData
    });
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

  DS.createUI = createUI;
  DS.extractLinks = extractLinks;
  DS.recursiveFetch = recursiveFetch;
})();
