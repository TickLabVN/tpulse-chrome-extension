import browser from "webextension-polyfill";

const APP_NAME = "com.ticklab.tpulse";
const port = browser.runtime.connectNative(APP_NAME);

function getTabDetails(tabId: number): Promise<ChromeTab> {
  return new Promise((resolve, reject) => {
    browser.tabs
      .get(tabId)
      .then((tab) => {
        const { title, url, windowId } = tab;
        const unixTs = Math.floor(Date.now() / 1000);
        const tabDetails: ChromeTab = {
          title: title || "",
          url: url || "",
          windowId: windowId || 0,
          time: unixTs,
          tabId,
        };
        resolve(tabDetails);
      })
      .catch((error) => {
        reject(new Error(error as string));
      });
  });
}

function watch() {
  browser.tabs.onActivated.addListener(function (activeInfo) {
    const tabId = activeInfo.tabId;
    getTabDetails(tabId)
      .then((tab) => {
        const message: BinaryMessage = { type: "ChromeTab", ...tab };
        port.postMessage(message);
      })
      .catch((error) => console.error("Error getting tab information:", error));
  });
  browser.webNavigation.onCommitted.addListener(function (details) {
    // Check if the navigation is to the main frame
    if (details.frameId === 0) {
      const tabId = details.tabId;
      getTabDetails(tabId)
        .then((tab) => {
          const message: BinaryMessage = { type: "ChromeTab", ...tab };
          port.postMessage(message);
        })
        .catch((error) =>
          console.error("Error getting tab information:", error)
        );
    }
  });

  /**
   * @description notify contentScript page is updated
   */
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      tab.url.startsWith("http")
    ) {
      const newMessage: BrowserMessage = {
        type: "ticklabvn.tpulse.NEW_VIDEO",
      };
      browser.tabs.sendMessage(tabId, newMessage);
    }
  });
  /**
   * @description get message from contentScript and handle
   */
  browser.runtime.onMessage.addListener((request, sender) => {
    if ((request.type = "ticklabvn.tpulse.UPDATE_VIDEO_STATUS")) {
      const tabId = sender?.tab?.id;
      const message: BinaryMessage = {
        type: "VideoStatus",
        tabId,
        ...request.payload,
      };
      port.postMessage(message);
    }
  });
}

watch();
