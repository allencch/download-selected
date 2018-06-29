(() => {
  const extractLinks = selection => Array.from(selection.anchorNode.parentNode.children).filter(el => el.nodeName === 'A');

  const selection = window.getSelection();
  const links = extractLinks(selection);
  console.log(links);
})();
