import pLimit from "p-limit";
import { database } from "../external-services/database/database.ts";
import type { Match } from "../external-services/database/schemas/matchSchema.ts";
import type { VodCalibration } from "../external-services/database/schemas/vodCalibrationSchema.ts";
import { downloadVideo } from "./videoDownloader.ts";
import { extractFrames, processFrames } from "./videoProcessor.ts";
import { ObjectId } from "mongodb";

type GameVod = Match["games"][number]["vods"][number];

const PREFERRED_LOCALES = ["en-US"] as const;

export interface PreprocessOptions {
  concurrency?: number;
  force?: boolean;
  matchIds?: string[];
}

export interface PreprocessStats {
  processed: number;
  skipped: number;
  failed: number;
  missingVod: number;
}

type CalibrationPoint = VodCalibration["calibrationPoints"][number];

export async function preprocessGameVods(options: PreprocessOptions = {}): Promise<PreprocessStats> {
  const { concurrency = 2, force = false, matchIds } = options;
  const matches = matchIds && matchIds.length > 0
    ? await database.models.Match.find({ _id: { $in: matchIds.map(id => new ObjectId(id)) } })
    : await database.models.Match.find({});

  const stats: PreprocessStats = {
    processed: 0,
    skipped: 0,
    failed: 0,
    missingVod: 0,
  };

  const limit = pLimit(concurrency);
  const tasks: Promise<void>[] = [];

  for (const match of matches) {
    const matchExternalId = match.externalIds.leagueOfLegends;
    const matchId = match._id;
    for (const [gameIndex, game] of Object.entries(match.games)) {
      const gameExternalId = game.externalIds.leagueOfLegends;
      const selectedVod = pickPreferredVod(game.vods);

      if (!selectedVod) {
        stats.missingVod++;
        console.warn(`Skipping game ${gameExternalId}: no VOD with timestamps found.`);
        continue;
      }

      tasks.push(
        limit(async () => {
          const existing = (await database.models.VodCalibration.findOne({
            "vod.youTubeId": selectedVod.youTubeId,
            gameNumber: Number(gameIndex),
            matchId,
          }));
          if (existing && !force && existing.calibrationPoints.length > 0) {
            stats.skipped++;
            return;
          }

          try {
            console.log(`Preprocessing VOD ${selectedVod.youTubeId} for game ${gameExternalId} (match ${matchExternalId}).`);
            const calibrationPoints = await computeCalibrationPoints(selectedVod);

            await database.models.VodCalibration.upsert(
              {
                matchId,
                gameNumber: Number(gameIndex),
                "vod.youTubeId": selectedVod.youTubeId,
              },
              {
                $set: {
                  matchId,
                  gameNumber: Number(gameIndex),
                  vod: { youTubeId: selectedVod.youTubeId },
                  calibrationPoints,
                },
              },
            );

            stats.processed++;
            if (calibrationPoints.length === 0) {
              console.warn(`No calibration points extracted for game ${gameExternalId}.`);
            }
          } catch (error) {
            stats.failed++;
            console.error(`Failed to preprocess game ${gameExternalId}:`, error);
          }
        }),
      );
    }
  }

  await Promise.all(tasks);

  return stats;
}

function pickPreferredVod(vods: GameVod[]) {
  const withTimestamps = vods.filter(hasTimestamps);
  if (withTimestamps.length === 0) {
    return null;
  }

  for (const locale of PREFERRED_LOCALES) {
    const match = withTimestamps.find((vod) => vod.lang?.toLowerCase() === locale.toLowerCase());
    if (match) {
      return match;
    }
  }

  return withTimestamps[0] ?? null;
}

function hasTimestamps(vod: GameVod): vod is GameVod & {
  startTimestamp: NonNullable<GameVod["startTimestamp"]>;
  endTimestamp: NonNullable<GameVod["endTimestamp"]>;
} {
  return typeof vod.startTimestamp === "number" && typeof vod.endTimestamp === "number";
}

async function computeCalibrationPoints(vod: GameVod): Promise<CalibrationPoint[]> {
  const videoPath = await downloadVideo(vod.youTubeId);
  const frames = await extractFrames(videoPath, vod);
  const gameTimers = await processFrames(frames.map((frame) => frame.path));

  const calibrationPoints: CalibrationPoint[] = [];

  for (let index = 0; index < frames.length; index++) {
    const gameSeconds = gameTimers[index];
    if (gameSeconds === null || gameSeconds === undefined) {
      continue;
    }

    const frame = frames[index];
    if (!frame) {
      continue;
    }
    calibrationPoints.push({
      gameSeconds,
      videoTimestampSeconds: frame.timestamp,
    });
  }

  calibrationPoints.sort((a, b) => a.gameSeconds - b.gameSeconds);

  return calibrationPoints;
}

if (import.meta.main) {
  try {
    const stats = await preprocessGameVods();
    console.log(
      `Game VOD preprocessing finished. processed=${stats.processed} skipped=${stats.skipped} failed=${stats.failed} missingVod=${stats.missingVod}`,
    );
  } catch (error) {
    console.error("Game VOD preprocessing failed:", error);
    process.exitCode = 1;
  }
}
