const { ipcRenderer } = require('electron');
// Google chat initially loads favicon with rel="icon",
// but replace it with rel="shortcut icon" when a new message appears.
// We need to query for both elements
const targetSelectors = [
    'link#favicon256',
    'link[rel="shortcut icon"]',
    'link[rel="icon"]'
  ];
  
let previousHref;
const emitFaviconChanged = (favicon) => {
    const href = favicon?.href || '';

    if (previousHref === href) {
        return;
    }
    previousHref = href;

    ipcRenderer.send('favicon-changed', href);
}

const initObserver = () => {
    let favicons = document.head.querySelectorAll(targetSelectors.join(','));
    emitFaviconChanged(favicons[0]);
}

let interval;
window.addEventListener('DOMContentLoaded', () => {
    clearInterval(interval);
    interval = setInterval(initObserver, 1000)
});
console.log("RKHGSFDHSGJHSFGJDFHFGHKFGJKg");

window.open = function customWindowOpen (url, ...args) {
    ipcRenderer.send('report-window-open', location.origin, url, args)
    return defaultWindowOpen(url + '?from_electron=1', ...args)
  }
