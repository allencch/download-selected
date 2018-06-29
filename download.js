(() => {
  const extractLinks = selection => (
    Array.from(selection.anchorNode.parentNode.children)
      .filter(el => el.nodeName === 'A')
      .map(el => ({
        text: el.innerHTML,
        url: el.href
      }))
  );

  const selection = window.getSelection();
  const links = extractLinks(selection);
  browser.runtime.sendMessage({
    cmd: 'create-download',
    links
  });
})();
