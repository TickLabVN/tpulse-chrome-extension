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
  type: `${MessageTypePrefix}${"TAB_UPDATE" | "UPDATE_VIDEO_STATUS"}`;
  payload?: VideoStatusPayload;
};

type BrowserTab = {
  title: string;
  url: string;
  windowId: number;
  time: number;
  tabId?: number;
};

type VideoStatusPayloadWithTabId = VideoStatusPayload & { tabId?: number };
type BinaryMessage = (VideoStatusPayloadWithTabId | BrowserTab) & {
  type: "BrowserTab" | "VideoStatus";
};
