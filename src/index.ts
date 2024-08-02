import browser, { Tabs, WebNavigation } from "webextension-polyfill";
import { getTabDetails, isUserTab } from "./utils";
import { BrowserMetricType, pushMetric } from "./port";

// Watch for tab changes
function onTabActive(activeInfo: Tabs.OnActivatedActiveInfoType) {
  const tabId = activeInfo.tabId;
  getTabDetails(tabId)
    .then((tab) => {
      if (!isUserTab(tab)) return;
      pushMetric({
        type: BrowserMetricType.Tab,
        ...tab,
      });
    })
    .catch((error) => console.error("Error getting tab information:", error));
}

// Check if user navigates to a new URL
function onEnterURL(details: WebNavigation.OnCommittedDetailsType) {
  // Check if the navigation is to the main frame
  if (details.frameId !== 0) return;
  const tabId = details.tabId;
  getTabDetails(tabId)
    .then((tab) => {
      if (!isUserTab(tab)) return;
      pushMetric({ type: BrowserMetricType.Tab, ...tab });
    })
    .catch((error) => console.error("Error getting tab information:", error));
}

function watchVideoPlayer(
  tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
) {
  if (changeInfo.status !== "complete" || !isUserTab(tab)) return;
  const newMessage: BrowserMessage = {
    type: "ticklabvn.tpulse.NEW_VIDEO",
  };
  browser.tabs.sendMessage(tabId, newMessage);
}

browser.tabs.onActivated.addListener(onTabActive);
browser.webNavigation.onCommitted.addListener(onEnterURL);
browser.tabs.onUpdated.addListener(watchVideoPlayer);

/**
 * @description get message from contentScript and handle
 */
browser.runtime.onMessage.addListener((request, sender) => {
  if (request.type === "ticklabvn.tpulse.UPDATE_VIDEO_STATUS") {
    const tabId = sender?.tab?.id;
    
    pushMetric({
      type: BrowserMetricType.VideoStatus,
      tabId,
      ...request.payload,
    });
  }
});
