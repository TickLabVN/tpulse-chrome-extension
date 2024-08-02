type VideoStatus = {
  paused: boolean;
  startTime?: number;
};

/**
 * The MessageTypePrefix is a unique identifier specific to the TicklabVN Tpulse extension.
 */
type MessageTypePrefix = "ticklabvn.tpulse.";

type BrowserMessageType = "UPDATE_VIDEO_STATUS" | "NEW_VIDEO";

type BrowserMessage = {
  type: `${MessageTypePrefix}${BrowserMessageType}`;
  payload?: VideoStatus;
};

type BrowserTab = {
  title: string;
  url: string;
  time: number;
};
