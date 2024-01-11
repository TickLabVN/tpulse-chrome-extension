import browser from "webextension-polyfill";

type ChromeTab = {
  title: string;
  url: string;
  windowId: number;
  time: number;
};

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
    //TODO: remove this
    console.log("tabs.onActivated");
    getTabDetails(tabId)
      .then((tab) => port.postMessage(tab))
      .catch((error) => console.error("Error getting tab information:", error));
  });
  browser.webNavigation.onCommitted.addListener(function (details) {
    // Check if the navigation is to the main frame
    if (details.frameId === 0) {
      const tabId = details.tabId;
      //TODO: remove this
      console.log("webNavigation.onCommitted");
      getTabDetails(tabId)
        .then((tab) => console.log(tab)) //port.postMessage(tab))
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
      const newMessage: Message = {
        type: "NEW",
      };
      browser.tabs.sendMessage(tabId, newMessage);
    }
  });
  /**
   * @description get message from contentScript and handle
   */
  browser.runtime.onMessage.addListener((request) => {
    if ((request.type = "UPDATE_VIDEO_STATUS"))
      //TODO: implement multiprocessing communication send data to eventEmitter
      console.log(request.videoStatus);
  });
}

watch();
