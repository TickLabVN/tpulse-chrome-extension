type VideoStatus = {
  paused: boolean;
  startTime?: Time;
};

type Message = {
  type: "NEW" | "UPDATE_VIDEO_STATUS";
  value?: string | Record<string, string | number>;
};
