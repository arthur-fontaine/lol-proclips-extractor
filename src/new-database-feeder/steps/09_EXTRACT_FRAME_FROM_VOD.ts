import fs from 'node:fs';
import path from "node:path";
import ffmpeg from 'fluent-ffmpeg';
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IVodFrame } from '../types/IVodFrame.ts';
import { PICK_PREFERRED_VOD } from './07_PICK_PREFERRED_VOD.ts';

export const EXTRACT_FRAME_FROM_VOD = createWorkflowStep({
  name: "EXTRACT_FRAME_FROM_VOD",
  async *execute({ vodPath }: { vodPath: string }, ctx) {
    const preferredVod = ctx.getHistory(PICK_PREFERRED_VOD)[0]?.vod;
    if (!preferredVod) throw new Error("No preferred VOD found in context history.");

    const framesCount = 4;

    const videoName = path.basename(vodPath, path.extname(vodPath));
    const outputFramesDir = path.resolve('frames', videoName);

    if (!fs.existsSync(outputFramesDir)) fs.mkdirSync(outputFramesDir, { recursive: true });

    const startTime = preferredVod.startMillis / 1000 + 5 * 60; // Start time in seconds + 5 minutes to skip draft and intro
    const endTime = preferredVod.endMillis / 1000;
    const duration = endTime - startTime;
    const interval = duration / framesCount;

    const vodFrames: IVodFrame[] = [];

    for (let i = 0; i < framesCount; i++) {
      const videoTimestamp = startTime + i * interval;
      const outputFramePath = path.join(outputFramesDir, `frame-${i + 1}.png`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(vodPath)
          .screenshots({
            timestamps: [videoTimestamp],
            filename: path.basename(outputFramePath),
            folder: outputFramesDir,
          })
          .on('end', () => resolve())
          .on('error', reject);
      });

      vodFrames.push({ path: outputFramePath, videoTimestamp });
    }

    // fs.unlinkSync(game.downloadedVodPath);

    yield* vodFrames.map(vodFrame => ({ vodFrame }));
  },
})
