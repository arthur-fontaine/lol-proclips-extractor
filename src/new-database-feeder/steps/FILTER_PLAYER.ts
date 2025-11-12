import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IAggregatedGame } from "../types/IAggregatedGame.ts";
import { formatSummonerName } from "../utils/formatSummonerName.ts";

export const FILTER_BY_PLAYER = createWorkflowStep({
  name: "FILTER_BY_PLAYER",
  async *execute({ game }: { game: IAggregatedGame }) {
    const participants = [
      ...game.gameMetadata?.blueTeamMetadata.participantMetadata || [],
      ...game.gameMetadata?.redTeamMetadata.participantMetadata || [],
    ];
    if (participants.some(p => formatSummonerName(p.summonerName).toLowerCase() === "kyeahoo")) {
      yield { game };
    }
  },
})
