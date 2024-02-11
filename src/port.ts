import browser from "webextension-polyfill";
import { APP_NAME } from "./constants";

const rawPort = browser.runtime.connectNative(APP_NAME);

export enum BrowserMetricType {
    Tab = 1,
    VideoStatus = 2,
}

export type BrowserMetric = (VideoStatus & { tabId?: string, type: BrowserMetricType.VideoStatus })
    | (BrowserTab & { type: BrowserMetricType.Tab });

export const pushMetric = (message: BrowserMetric) => rawPort.postMessage(message);