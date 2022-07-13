import { fetchByXhr } from './xhrFetch.js';
import JSZip from './jszip.js';

const NUM_JOB = 2;
var browser = browser || chrome;

const notifyTab = (tabId, message) => {
  browser.tabs.sendMessage(tabId, {
    type: 'WRITE_MESSAGE',
    message
  });
};

const getFileExtension = (url) => {
  const matches = url.match(/\.(\w+)\b/g);
  if (!matches) {
    return null;
  }
  const lastMatch = matches[matches.length - 1];
  return lastMatch.substring(1);
};

// @deprecated
const downloadFile = (link, onError) => {
  return new Promise((resolve, reject) => {
    return fetch(link.url, {
      referrer: link.referrer
    }).then(response => {
      if (response.ok) {
        const name = `${link.text}.${getFileExtension(link.url)}`;
        return response
          .arrayBuffer()
          .then(data => {
            resolve({
              ...link,
              name,
              data
            });
          });
      } else {
        return onError(reject);
      }
    });
  });
};

const _downloadFile = (link, onError) => {
  return new Promise((resolve, reject) => {
    return fetchByXhr(link.url, {
      referrer: link.referrer
    }).then(arrayBuffer => {
      const name = `${link.text}.${getFileExtension(link.url)}`;
      return resolve({
        ...link,
        name,
        data: arrayBuffer
      });
    }).catch((err) => {
      console.log(err);
      return onError(reject);
    });
  });
};

const createZip = (fetchedData, tabId) => {
  const zip = JSZip();

  for (let i = 0; i < fetchedData.length; i++) {
    const link = fetchedData[i];
    zip.file(link.name, link.data);
  }

  const result = zip.generateAsync({ type: 'base64' });
  notifyTab(tabId, 'Zipping...');
  result.then(content => {
    notifyTab(tabId, 'Done');

    browser.tabs.sendMessage(tabId, {
      type: 'SAVE_ZIP',
      data: content
    });
  }).catch(err => {
    notifyTab(tabId, `Error: ${err}`);
    console.log(err);
  });
};


export const recursiveFetch = (fetchedData = [], links, count, { tabId }) => {
  if (count >= links.length) {
    notifyTab(tabId, 'Finish');
    createZip(fetchedData, tabId);
    return;
  }

  const two = links.slice(count, count + NUM_JOB);
  const promises = two.map(link => downloadFile(link, (reject) => {
    const message = `Fail download ${link.url}`;
    notifyTab(tabId, message);
    return reject(new Error(message));
  }));

  Promise.all(promises).then(list => {
    list.forEach(link => {
      notifyTab(tabId, `${link.text} downloaded`);
      fetchedData.push(link);
    });
    recursiveFetch(fetchedData, links, count + NUM_JOB, { tabId });
  });
};
