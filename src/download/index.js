// Main
(() => {
  const { DS } = window;
  DS.createUI();
  const selection = window.getSelection();
  const links = DS.extractLinks(selection);

  if (links.length === 0) return;

  DS.recursiveFetch([], links, 0);
})();
