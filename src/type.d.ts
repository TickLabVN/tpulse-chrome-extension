type VideoStatus = {
  paused: boolean;
  startTime?: number;
};

/**
 * The MessageTypePrefix is a unique identifier specific to the TicklabVN Tpulse extension.
 */
type MessageTypePrefix = "ticklabvn.tpulse.";

type BrowserMessage = {
  type: `${MessageTypePrefix}${"UPDATE_VIDEO_STATUS"}`;
  payload?: VideoStatus;
};

type BrowserTab = {
  title: string;
  url: string;
  windowId: number;
  time: number;
  tabId?: number;
};
