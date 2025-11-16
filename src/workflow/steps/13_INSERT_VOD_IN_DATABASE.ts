import { database } from "../../external-services/database/database.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IVodFrame } from "../types/IVodFrame.ts";
import { FETCH_GAME } from "./05_FETCH_GAME.ts";
import { DOWNLOAD_VOD } from "./10_DOWNLOAD_VOD.ts";

export const INSERT_VOD_IN_DATABASE = createWorkflowStep({
  name: "INSERT_VOD_IN_DATABASE",
  async *execute({ vodFrames }: { vodFrames: IVodFrame.With<IVodFrame.GameTimestamp>[] }, ctx) {
    const vod = ctx.getHistory(DOWNLOAD_VOD)[0]?.vod;
    if (!vod) throw new Error("No VOD found in context history.");
    const game = ctx.getHistory(FETCH_GAME)[0]?.game;
    if (!game) throw new Error("No game found in context history.");

    const insertedVod = await database.models.Vod.insertOne(
      {
        youtubeId: vod.parameter,
        calibrationPoints: vodFrames
          .filter(vodFrame => vodFrame.gameTimestampSeconds !== null && vodFrame.videoTimestampSeconds !== null)
          .map(vodFrame => ({
            gameTimestampSeconds: vodFrame.gameTimestampSeconds!,
            videoTimestampSeconds: vodFrame.videoTimestampSeconds!,
          })),
      },
    )

    await database.models.Match.updateOne(
      { "games.externalIds.leagueOfLegends": game.id },
      {
        $push: {
          "games.$.vods": insertedVod._id,
        },
      },
    )

    yield;
  },
  config: {
    concurrency: 1, // Ensure VODs are inserted one at a time to avoid race conditions (duplicated youtubeId)
  },
})
