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
    // convert NodeList to array so we can use 'some' iteration on it
    let favicons = [].slice.call(document.head.querySelectorAll(targetSelectors.join(',')));
    let fi = favicons[0];
    favicons.some(function(d){
        // compat with old chat : selectAll returns too many things
        if (d.id === "favicon256"){
            fi=d
            return true;
        }
    })
    emitFaviconChanged(fi);
}

let interval;
window.addEventListener('DOMContentLoaded', () => {
    clearInterval(interval);
    interval = setInterval(initObserver, 1500)
});
