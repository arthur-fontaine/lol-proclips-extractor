import fs from "node:fs";
import path from "node:path";
import { YtDlp } from "ytdlp-nodejs";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IVod } from "../types/IVod.ts";
import { FETCH_GAME } from "./05_FETCH_GAME.ts";

const downloadPromises = new Map<string, Promise<string>>();

export const DOWNLOAD_VOD = createWorkflowStep({
  name: "DOWNLOAD_VOD",
  async *execute({ vod }: { vod: IVod }, ctx) {
    if (ctx.getHistory(FETCH_GAME).length !== 1) // Runtime testing
      throw new Error("Expected exactly one game from FETCH_GAME step.");

    if (vod.provider === 'youtube') {
      const youTubeId = vod.parameter;
      const downloadedVodPath = path.resolve(`./videos/${youTubeId}.webm`);

      if (fs.existsSync(downloadedVodPath)) {
        yield { vod: { ...vod, localPath: downloadedVodPath } };
        return;
      }

      if (downloadPromises.has(youTubeId)) {
        await downloadPromises.get(youTubeId);
        yield { vod: { ...vod, localPath: downloadedVodPath } };
        return;
      }

      const ytdlp = new YtDlp();

      const downloadPromise = ytdlp.downloadAsync(`https://www.youtube.com/watch?v=${youTubeId}`, {
        output: downloadedVodPath,
        format: {
          filter: 'videoonly',
          quality: '480p',
          type: 'webm',
        },
      });
      downloadPromises.set(youTubeId, downloadPromise);
      await downloadPromise;

      yield { vod: { ...vod, localPath: downloadedVodPath } };
    }
  },
  config: { concurrency: 4 },
})
