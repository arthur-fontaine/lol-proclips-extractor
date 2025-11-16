import { database } from "../../external-services/database/database.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IVodFrame } from "../types/IVodFrame.ts";
import { DOWNLOAD_VOD } from "./10_DOWNLOAD_VOD.ts";

export const INSERT_VOD_IN_DATABASE = createWorkflowStep({
  name: "INSERT_VOD_IN_DATABASE",
  async *execute({ vodFrame }: { vodFrame: IVodFrame.With<IVodFrame.GameTimestamp> }, ctx) {
    if (!vodFrame.gameTimestampSeconds) return;

    const vod = ctx.getHistory(DOWNLOAD_VOD)[0]?.vod;
    if (!vod) throw new Error("No VOD found in context history.");

    await database.models.Vod.upsert(
      { youtubeId: vod.parameter },
      {
        $setOnInsert: {
          youtubeId: vod.parameter,
          calibrationPoints: [],
        },
        $push: {
          calibrationPoints: {
            gameTimestampSeconds: vodFrame.gameTimestampSeconds,
            videoTimestampSeconds: vodFrame.videoTimestampSeconds,
          },
        },
      },
    )

    yield;
  },
})
