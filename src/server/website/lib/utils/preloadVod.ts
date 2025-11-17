import { api } from "../api.ts";
import { CLIP_MARGIN_SECONDS } from "../constants.ts";
import { calibrateVod } from "./calibrateVod.ts";
import { getYoutubeEmbedLink } from "./getYoutubeEmbedLink.ts";

export async function preloadVod(vodId: string, eventGameTime: number) {
  const { vod } = await api.v1.vods[":vodId"].$get({
    param: { vodId },
  }).then(req => req.json());

  if (!vod?.youtubeId) return;

  const endVideoTime = calibrateVod(vod, eventGameTime);
  const startVideoTime = endVideoTime - CLIP_MARGIN_SECONDS;

  const youtubeEmbedLink = getYoutubeEmbedLink(
    vod.youtubeId,
    startVideoTime,
    endVideoTime,
  );
  document.head.insertAdjacentHTML('beforeend', `
    <link 
      rel="preload" 
      as="document" 
      href="${youtubeEmbedLink}" 
      crossorigin="anonymous"
    >
  `);
}
