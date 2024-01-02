/**
 * @typedef {{
 *  title: string,
 *  url: string,
 *  windowId: number
 * }} ChromeTab
 */

/**
 * 
 * @param {ChromeTab} tab 
 */
function tabHandler(tab) {
    const unixTs = Math.floor(Date.now() / 1000);
    const data = {
        time: unixTs,
        windowId: tab.windowId,
        title: tab.title,
        url: tab.url
    }

    // TODO: send data to tpulse
    console.log(data);
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    const tabId = activeInfo.tabId;
    chrome.tabs.get(tabId, tabHandler);
});


