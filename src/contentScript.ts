import moment from "moment";
import browser from "webextension-polyfill";

let videoPlayers: HTMLCollectionOf<HTMLVideoElement> | null = null;

const videoStatus: VideoStatus = {
  // User is watching video or not
  paused: true,
};

const updateStatus = (event: Event) => {
  if (!videoPlayers) return;

  if (event.type === "play") {
    // User is already watching video
    if (!videoStatus.paused) return;

    // Otherwise, update status
    videoStatus.paused = false;
    videoStatus.startTime = moment().unix();

    const message: BrowserMessage = {
      type: "ticklabvn.tpulse.UPDATE_VIDEO_STATUS",
      payload: videoStatus,
    };
    //send data to background
    browser.runtime.sendMessage(message);
  }

  //only stop left
  for (let i = 0; i < videoPlayers.length; i++) {
    const video = videoPlayers[i];
    if (!video.paused) return; //still have video is playing, videoStatus must already be true right now
  }

  //all video stopped
  videoStatus.paused = true;
  videoStatus.startTime = moment().unix();

  //send data to background
  const message: BrowserMessage = {
    type: "ticklabvn.tpulse.UPDATE_VIDEO_STATUS",
    payload: videoStatus,
  };
  browser.runtime.sendMessage(message);
};

/**
 * @description Initial value for videoStatus. Adding pause, play event listener to each videos in page.
 */
function executeContentScript() {
  videoPlayers = document.getElementsByTagName("video");
  if (videoPlayers.length === 0) return;

  for (let i = 0; i < videoPlayers.length; i++) {
    const videoPlayer = videoPlayers[i];
    videoPlayer.addEventListener("pause", updateStatus);
    videoPlayer.addEventListener("play", updateStatus);

    if (videoStatus.paused && !videoPlayer.paused) {
      videoStatus.paused = false;
      videoStatus.startTime = moment().unix();
    }
  }

  if (videoStatus.paused) {
    videoStatus.startTime = moment().unix();
  }

  //send data to background
  const message: BrowserMessage = {
    type: "ticklabvn.tpulse.UPDATE_VIDEO_STATUS",
    payload: videoStatus,
  };
  browser.runtime.sendMessage(message);
}

browser.runtime.onMessage.addListener((obj: BrowserMessage) => {
  const { type } = obj;

  if (type === "ticklabvn.tpulse.NEW_VIDEO") {
    executeContentScript();
  }
});
