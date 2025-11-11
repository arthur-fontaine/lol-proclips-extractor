import fs from 'node:fs';
import path from 'node:path';
import ffmpeg from 'fluent-ffmpeg';
import { Ollama } from 'ollama';
import { env } from '../external-services/env/env.ts';
import type { Match } from '../external-services/database/schemas/matchSchema.ts';

export async function extractFrames(videoPath: string, vod: Match['games'][number]['vods'][number], framesCount = 4) {
  const videoName = path.basename(videoPath, path.extname(videoPath));
  const outputFramesDir = path.resolve('frames', videoName);

  if (!fs.existsSync(outputFramesDir)) {
    fs.mkdirSync(outputFramesDir);
  }

  if (!vod.startTimestamp || !vod.endTimestamp) {
    throw new Error('VOD must have startTimestamp and endTimestamp defined to extract frames.');
  }

  const startTime = vod.startTimestamp / 1000 + 5 * 60; // Start time in seconds + 5 minutes to skip draft and intro
  const endTime = vod.endTimestamp / 1000;
  const duration = endTime - startTime;
  const interval = duration / framesCount;

  const framePaths: { path: string, timestamp: number }[] = [];

  for (let i = 0; i < framesCount; i++) {
    const timestamp = startTime + i * interval;
    const outputFramePath = path.join(outputFramesDir, `frame-${i + 1}.png`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputFramePath),
          folder: outputFramesDir,
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    framePaths.push({ path: outputFramePath, timestamp });
  }

  return framePaths;
}

export async function processFrames(framePaths: string[]) {
  const ai = new Ollama({ host: env.ollamaApiUrl });
  return await Promise.all(framePaths.map(async (framePath) => {
    const image = fs.readFileSync(framePath);

    const response = await ai.chat({
      messages: [
        {
          role: 'user',
          content:
            'Find and output only the in-game timer in the image (often at the top-center), formatted as mm:ss. Only output the exact visible mm:ss text. If no clear mm:ss timer is visible, output: N/A',
          images: [image],
        },
      ],
      model: 'qwen2.5vl:latest',
      options: {
        temperature: 0.1,
        top_p: 0.95,
      },
    });

    return parseGameTimer(response.message.content);
  }));
}

function parseGameTimer(timerText: string): number | null {
  const match = timerText.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const minutes = parseInt(match[1]!, 10);
    const seconds = parseInt(match[2]!, 10);
    return minutes * 60 + seconds;
  }
  return null;
}
