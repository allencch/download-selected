/* global chrome */
(() => {
  const NUM_JOB = 2;
  var browser = browser || chrome;

  // Setup
  window.DS = window.DS || {};
  const { DS } = window;

  /**************
   * Extract Links
   **************/

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

  DS.extractLinks = extractLinks;
})();
