import browser from "webextension-polyfill";
import { APP_NAME } from "./constants";

const rawPort = browser.runtime.connectNative(APP_NAME);
export const pushMetric = (message: BrowserTab) => rawPort.postMessage(message);