(() => {
  // Setup
  window.DS = window.DS || {};
  const { DS } = window;

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

  DS.createUI = createUI;
})();
