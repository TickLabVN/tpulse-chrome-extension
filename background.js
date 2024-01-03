/**
 * @typedef {{
 *  title: string,
 *  url: string,
 *  windowId: number
 * }} ChromeTab
 */

const APP_NAME = "com.ticklab.tpulse";
const port = chrome.runtime.connectNative(APP_NAME);

/**
 * 
 * @param {ChromeTab} tab 
 */
function tabHandler(tab) {
    const unixTs = Math.floor(Date.now() / 1000);
    const tabInformation = {
        time: unixTs,
        windowId: tab.windowId,
        title: tab.title,
        url: tab.url
    }

    port.postMessage(tabInformation);
}

function watch() {
    chrome.tabs.onActivated.addListener(function (activeInfo) {
        const tabId = activeInfo.tabId;
        console.log("tabs.onActivated");
        chrome.tabs.get(tabId, tabHandler);
    });
    chrome.webNavigation.onCommitted.addListener(function (details) {
        // Check if the navigation is to the main frame
        if (details.frameId === 0) {
            console.log("webNavigation.onCommitted");
            const tabId = details.tabId;
            chrome.tabs.get(tabId, tabHandler);
        }
    });
}

watch();