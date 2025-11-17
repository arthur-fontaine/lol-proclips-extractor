import type { Vod } from "../../../../external-services/database/schemas/vodSchema.ts";

export function calibrateVod(
  vod: Pick<Vod, 'calibrationPoints'> | null,
  eventGameTime: number,
) {
  if (!vod) return 0;

  const calibrationPoints = vod.calibrationPoints.toSorted((a, b) => a.gameTimestampSeconds - b.gameTimestampSeconds);

  for (const point of calibrationPoints) {
    if (point.gameTimestampSeconds < eventGameTime) {
      return point.videoTimestampSeconds + eventGameTime - point.gameTimestampSeconds;
    }
  }

  return 0;
}
