(() => {
  // Setup
  window.DS = window.DS || {};
  const { DS } = window;

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

  DS.getChildren = getChildren;
})();
