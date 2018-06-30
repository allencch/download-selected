(() => {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.cmd) {
      case 'message':
        console.log(request.message);
    }
  });

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

  const selection = window.getSelection();
  const links = extractLinks(selection);

  browser.runtime.sendMessage({
    cmd: 'create-download',
    links
  });
})();
