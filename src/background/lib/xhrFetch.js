(() => {
  window.DSB = window.DSB || {};
  const { DSB } = window;

  const fetchByXhr = (url, options) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = 'arraybuffer';

      if (options.referrer) {
        xhr.setRequestHeader('Referrer', options.referrer);
      }

      xhr.onload = () => {
        const arrayBuffer = xhr.response;
        if (!arrayBuffer) {
          return reject('Failed');
        }
        return resolve(arrayBuffer);
      };
      xhr.send(null);
    });
  };

  DSB.fetchByXhr = fetchByXhr;
})();
