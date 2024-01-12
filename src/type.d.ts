type VideoStatus = {
  paused: boolean;
  startTime?: Time;
};

/**
 * The MessageTypePrefix is a unique identifier specific to the TicklabVN Tpulse extension.
 */
type MessageTypePrefix = "ticklabvn.tpulse.";

type VideoStatusPayload = Record<string, string | number | boolean>;

type BrowserMessage = {
  type: `${MessageTypePrefix}${"NEW_VIDEO" | "UPDATE_VIDEO_STATUS"}`;
  payload?: VideoStatusPayload;
};

type ChromeTab = {
  title: string;
  url: string;
  windowId: number;
  time: number;
  tabId?: number;
};

type VideoStatusPayloadWithTabId = VideoStatusPayload & { tabId?: number };
type BinaryMessage = (VideoStatusPayloadWithTabId | ChromeTab) & {
  type: "ChromeTab" | "VideoStatus";
};
