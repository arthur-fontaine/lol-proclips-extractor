import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";
import { formatSummonerName } from "../utils/formatSummonerName.ts";
import { FETCH_GAME } from "./05_FETCH_GAME.ts";

export const FILTER_GAME_BY_PLAYER = createWorkflowStep({
  name: "FILTER_GAME_BY_PLAYER",
  async *execute({ game }: { game: IGame.With<IGame.Aggregated> }, ctx) {
    if (ctx.getHistory(FETCH_GAME).length !== 1) // Runtime testing
      throw new Error("Expected exactly one game from FETCH_GAME step.");

    const participants = [
      ...game.gameMetadata?.blueTeamMetadata.participantMetadata || [],
      ...game.gameMetadata?.redTeamMetadata.participantMetadata || [],
    ];
    if (participants.some(p => formatSummonerName(p.summonerName).toLowerCase() === "kyeahoo")) {
      yield { game };
    }
  },
})
