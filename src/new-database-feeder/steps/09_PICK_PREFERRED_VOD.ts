import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";
import type { IVod } from "../types/IVod.ts";

export const PICK_PREFERRED_VOD = createWorkflowStep({
  name: "PICK_PREFERRED_VOD",
  async *execute({ game }: { game: IGame.With<IGame.Aggregated & IGame.Details> }) {
    const vodsWithTimestamps = game.vods.filter(hasTimestamps);

    const preferredLocales = ["en-US", "en-GB", "en"] as const;
    for (const locale of preferredLocales) {
      const vod = vodsWithTimestamps.find(v => v.locale.toLowerCase() === locale.toLowerCase());
      if (vod) {
        yield { vod };
        return;
      }
    }

    const fallbackVod = vodsWithTimestamps[0];
    if (fallbackVod !== undefined) yield { vod: fallbackVod };
  },
})

function hasTimestamps(vod: IGame["vods"][number]): vod is IVod {
  return typeof vod.startMillis === "number" && typeof vod.endMillis === "number";
}
