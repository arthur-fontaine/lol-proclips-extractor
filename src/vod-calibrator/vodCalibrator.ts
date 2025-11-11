import fs from 'fs';
import { Ollama } from 'ollama';
import { YtDlp, helpers as ytdlpHelpers } from 'ytdlp-nodejs';
import { env } from '../external-services/env/env.ts';
import ffmpeg, { type FfprobeData } from 'fluent-ffmpeg';
import path from 'path';
import { Readable } from 'stream';

// await ytdlpHelpers.downloadYtDlp();
// await ytdlpHelpers.downloadFFmpeg();
// await Promise.all([
//   ytdlpHelpers.downloadYtDlp(),
//   ytdlpHelpers.downloadFFmpeg(),
// ]);
// const ytdlp = new YtDlp();
// await ytdlp.downloadAsync('https://www.youtube.com/watch?v=qw7VAui52JY', {
//   output: './videos/qw7VAui52JY.webm',
//   format: {
//     filter: 'videoonly',
//     quality: '480p',
//     type: 'webm',
//   },
//   onProgress: (progress) => {
//     console.log('Download progress:', progress);
//   },
// });

// const ai = new Ollama({
//   host: env.ollamaApiUrl,
// });

// const image = fs.readFileSync('/Users/arthur-fontaine/Pictures/Screenshots/Screenshot 2025-11-11 at 17.16.04.png');

// async function main() {
//   const response = await ai.chat({
//     messages: [
//         {
//             "role": "user",
//             "content": 'Find and output only the in-game timer in the image (often at the top-center), formatted as mm:ss. Only output the exact visible mm:ss text. If no clear mm:ss timer is visible, output: N/A',
//             'images': [image],
//         }
//     ],
//     model: 'qwen2.5vl:latest',
//     options: {
//       temperature: 0.1,
//       top_p: 0.95,
//     },
//   });

//   console.dir(response, { depth: null });
// }

async function processVideo() {
  const inputVideoPath = path.resolve('./videos/qw7VAui52JY.webm');
  const outputFramesDir = path.resolve('frames');

  // Ensure the output directory exists
  if (!fs.existsSync(outputFramesDir)) {
    fs.mkdirSync(outputFramesDir);
  }

  // Define the start time and duration in seconds
  const startTime = 18180 + (5 * 60); // Start time in seconds (18180000ms) + 5 minutes
  const endTime = 20340;
  const duration = endTime - startTime;
  const interval = duration / 4; // Divide the duration into 4 intervals

  // Extract frames at 1/4 intervals within the specified bounds
  for (let i = 0; i < 4; i++) {
    const timestamp = startTime + i * interval;
    const outputFramePath = path.join(outputFramesDir, `frame-${i + 1}.png`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputVideoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputFramePath),
          folder: outputFramesDir,
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  console.log('Frames extracted successfully!');
}

// main();
processVideo();
