import browser from "webextension-polyfill";

let videoPlayers: HTMLCollectionOf<HTMLVideoElement>;

const videoStatus: VideoStatus = {
  paused: true,
};

const updateStatus = (event: Event) => {
  if (!videoPlayers) return;
  const updatingStatus = event.type;
  if (!videoStatus.paused && updatingStatus === "play") return;
  if (videoStatus.paused && updatingStatus === "play") {
    videoStatus.paused = false;
    videoStatus.startTime = Math.floor(Date.now() / 1000);
    //send data to background
    try {
      browser.runtime.sendMessage({ type: "UPDATE_VIDEO_STATUS", videoStatus });
    } catch (e) {
      console.error(e);
    }
  }

  //only stop left
  for (let i = 0; i < videoPlayers.length; i++) {
    const video = videoPlayers[i];
    if (!video.paused) return; //still have video is playing, videoStatus must already be true right now
  }

  //all video stopped
  videoStatus.paused = true;
  videoStatus.startTime = Math.floor(Date.now() / 1000);
  //send data to background
  try {
    browser.runtime.sendMessage({ type: "UPDATE_VIDEO_STATUS", videoStatus });
  } catch (e) {
    console.error(e);
  }
};

/**
 * @description Initial value for videoStatus. Adding pause, play event listener to each videos in page.
 */
const setupPlayerEventListeners = () => {
  videoPlayers = document.getElementsByTagName("video");
  if (videoPlayers.length > 0) {
    for (let i = 0; i < videoPlayers.length; i++) {
      const videoPlayer = videoPlayers[i];
      videoPlayer.addEventListener("pause", updateStatus);
      videoPlayer.addEventListener("play", updateStatus);

      if (videoStatus.paused && !videoPlayer.paused) {
        videoStatus.paused = false;
        videoStatus.startTime = Math.floor(Date.now() / 1000);
      }
    }

    if (videoStatus.paused) {
      videoStatus.startTime = Math.floor(Date.now() / 1000);
    }

    //send data to background
    try {
      browser.runtime.sendMessage({ type: "UPDATE_VIDEO_STATUS", videoStatus });
    } catch (e) {
      console.error(e);
    }
  }
};

browser.runtime.onMessage.addListener((obj) => {
  const { type } = obj;

  if (type === "NEW") {
    setupPlayerEventListeners();
  }
});
