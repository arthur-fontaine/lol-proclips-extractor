import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';

/**
 * Downloads a video from YouTube.
 * @param youTubeId - The YouTube video ID.
 * @returns The path to the downloaded video.
 */
export async function downloadVideo(youTubeId: string): Promise<string> {
  const ytdlp = new YtDlp();
  const outputPath = path.resolve(`./videos/${youTubeId}.webm`);

  await ytdlp.downloadAsync(`https://www.youtube.com/watch?v=${youTubeId}`, {
    output: outputPath,
    format: {
      filter: 'videoonly',
      quality: '480p',
      type: 'webm',
    },
  });

  return outputPath;
}