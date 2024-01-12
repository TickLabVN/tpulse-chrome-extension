type VideoStatus = {
  paused: boolean;
  startTime?: Time;
};

type BrowserMessage = {
  type: "NEW" | "UPDATE_VIDEO_STATUS";
  value?: string | Record<string, string | number>;
};

type ChromeTab = {
  title: string;
  url: string;
  windowId: number;
  time: number;
  tabId?: number;
};

type VideoStatusMessage = BrowserMessage & { tabId?: number };

type BinaryMessage = {
  type: "ChromeTab" | "VideoStatus";
  value: ChromeTab | VideoStatusMessage;
};
