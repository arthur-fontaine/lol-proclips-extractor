import fs from 'node:fs';
import path from "node:path";
import ffmpeg from 'fluent-ffmpeg';
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IVod } from '../types/IVod.ts';
import type { IVodFrame } from '../types/IVodFrame.ts';

export const EXTRACT_FRAME_FROM_VOD = createWorkflowStep({
  name: "EXTRACT_FRAME_FROM_VOD",
  async *execute({ vod }: { vod: IVod.With<IVod.LocalPath> }, ctx) {
    const framesCount = 4;

    const videoName = path.basename(vod.localPath, path.extname(vod.localPath));
    const outputFramesDir = path.resolve('frames', videoName);

    if (!fs.existsSync(outputFramesDir)) fs.mkdirSync(outputFramesDir, { recursive: true });

    const startTime = vod.startMillis / 1000 + 5 * 60; // Start time in seconds + 5 minutes to skip draft and intro
    const endTime = vod.endMillis / 1000;
    const duration = endTime - startTime;
    const interval = duration / framesCount;

    const vodFrames: IVodFrame[] = [];

    for (let i = 0; i < framesCount; i++) {
      const videoTimestampSeconds = startTime + i * interval;
      const outputFramePath = path.join(outputFramesDir, `frame-${i + 1}.png`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(vod.localPath)
          .screenshots({
            timestamps: [videoTimestampSeconds],
            filename: path.basename(outputFramePath),
            folder: outputFramesDir,
          })
          .on('end', () => resolve())
          .on('error', reject);
      });

      vodFrames.push({ path: outputFramePath, videoTimestampSeconds });
    }

    // fs.unlinkSync(game.downloadedVodPath);

    yield { vodFrames };
  },
})
