import browser from "webextension-polyfill";

type ChromeTab = {
  title: string;
  url: string;
  windowId: number;
  time: number;
}

const APP_NAME = "com.ticklab.tpulse";
const port = browser.runtime.connectNative(APP_NAME);

function getTabDetails(tabId: number): Promise<ChromeTab> {
  return new Promise((resolve, reject) => {
    browser.tabs.get(tabId)
      .then((tab) => {
        const { title, url, windowId } = tab;
        const unixTs = Math.floor(Date.now() / 1000);
        const tabDetails: ChromeTab = {
          title: title || "",
          url: url || "",
          windowId: windowId || 0,
          time: unixTs
        };
        resolve(tabDetails);
      })
      .catch((error) => {
        reject(new Error(error as string));
      })
  });
}

function watch() {
  browser.tabs.onActivated.addListener(function (activeInfo) {
    const tabId = activeInfo.tabId;
    console.log("tabs.onActivated");
    getTabDetails(tabId)
      .then((tab) => port.postMessage(tab))
      .catch((error) => console.error("Error getting tab information:", error));
  });
  browser.webNavigation.onCommitted.addListener(function (details) {
    // Check if the navigation is to the main frame
    if (details.frameId === 0) {
      const tabId = details.tabId;
      console.log("webNavigation.onCommitted");
      getTabDetails(tabId)
        .then((tab) => port.postMessage(tab))
        .catch((error) => console.error("Error getting tab information:", error));
    }
  });
}

watch();