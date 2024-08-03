import browser, { Tabs, WebNavigation } from "webextension-polyfill";
import { getTabDetails, isUserTab } from "./utils";
import { pushMetric } from "./port";

// Watch for tab changes
function onTabActive(activeInfo: Tabs.OnActivatedActiveInfoType) {
  const tabId = activeInfo.tabId;
  getTabDetails(tabId)
    .then((tab) => {
      if (!isUserTab(tab)) return;
      pushMetric(tab);
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
      pushMetric(tab);
    })
    .catch((error) => console.error("Error getting tab information:", error));
}


browser.tabs.onActivated.addListener(onTabActive);
browser.webNavigation.onCommitted.addListener(onEnterURL);
