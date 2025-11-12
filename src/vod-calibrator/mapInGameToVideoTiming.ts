import type { ObjectId } from "mongodb";
import { database } from "../external-services/database/database.ts";
import type { VodCalibration } from "../external-services/database/schemas/vodCalibrationSchema.ts";

async function mapInGameToVideoTiming({ matchId, gameNumber }: { matchId: ObjectId; gameNumber: number; }) {
  const calibration = (await database.models.VodCalibration.findOne({
    matchId,
    gameNumber,
  }));
  if (!calibration) {
    throw new Error(`No calibration data found for game ${matchId.toHexString()} number ${gameNumber}. Run preprocessGameVods before mapping.`);
  }

  const points = [...calibration.calibrationPoints].sort((a, b) => a.gameSeconds - b.gameSeconds);
  if (points.length === 0) {
    console.warn(`Calibration data for game ${matchId.toHexString()} number ${gameNumber} has no points.`);
    return () => null;
  }

  const mapTime = (gameSeconds: number): number | null => {
    const anchorIndex = findCalibrationIndex(points, gameSeconds);
    const anchor = points[anchorIndex];
    if (!anchor) {
      return null;
    }

    const diff = gameSeconds - anchor.gameSeconds;
    const videoTimestamp = anchor.videoTimestampSeconds + diff;

    console.log(
      `Mapping game time ${gameSeconds}s to video timestamp ${videoTimestamp}s using anchor point at game time ${anchor.gameSeconds}s and video timestamp ${anchor.videoTimestampSeconds}s.`,
    );

    return videoTimestamp;
  };

  return { mapTime, youtubeId: calibration.vod.youTubeId };
}

function findCalibrationIndex(points: VodCalibration["calibrationPoints"], gameSeconds: number) {
  const index = points.findIndex((point) => gameSeconds >= point.gameSeconds);
  return index === -1 ? 0 : index;
}

export { mapInGameToVideoTiming };
