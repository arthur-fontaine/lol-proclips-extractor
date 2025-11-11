import type { Match } from '../external-services/database/schemas/matchSchema.ts';
import { downloadVideo } from './videoDownloader.ts';
import { extractFrames, processFrames } from './videoProcessor.ts';

async function mapInGameToVideoTiming(vod: Match['games'][number]['vods'][number]) {
  const videoPath = await downloadVideo(vod.youTubeId);
  const frames = await extractFrames(videoPath, vod);
  const gameTimers = await processFrames(frames.map(f => f.path));

  return (gameSeconds: number): number | null => {
    let closestGameTimerIndex = gameTimers.findIndex(gt => gt !== null && gameSeconds >= gt);
    if (closestGameTimerIndex === -1) closestGameTimerIndex = 0;

    const diff = gameSeconds - gameTimers[closestGameTimerIndex]!;
    const frame = frames[closestGameTimerIndex]!;

    console.log(`Mapping game time ${gameSeconds} to video time using frame at index ${closestGameTimerIndex} with game timer ${gameTimers[closestGameTimerIndex]} and diff ${diff}`);

    return frame.timestamp + diff;
  }
}

// const fn = await mapInGameToVideoTiming({
//   youTubeId: 'qw7VAui52JY',
//   startMillis: 18180000,
//   endMillis: 20340000,
// })
// console.log(fn(0))
// console.log(fn(300))
// console.log(fn(1050))

export { mapInGameToVideoTiming };
