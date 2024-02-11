
import browser from "webextension-polyfill";
export const isUserTab = (tab: BrowserTab | browser.Tabs.Tab) =>
  tab.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"));

export async function getTabDetails(tabId: number): Promise<BrowserTab> {
  const tab = await browser.tabs.get(tabId);
  const { title, url, windowId } = tab;
  const unixTs = Math.floor(Date.now() / 1000);
  const tabDetails: BrowserTab = {
    title: title || "",
    url: url || "",
    windowId: windowId || 0,
    time: unixTs,
    tabId,
  };
  return tabDetails;
}
