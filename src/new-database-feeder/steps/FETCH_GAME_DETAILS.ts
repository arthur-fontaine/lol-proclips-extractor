import { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";
import type { IGameDetails } from "../types/IGameDetails.ts";

export const FETCH_GAME_DETAILS = createWorkflowStep({
  name: "FETCH_GAME_DETAILS",
  async *execute({ game }: { game: IGame }) {
    const details = await fetchGameDetails(game);
    yield { ...game, details };
  },
})

async function fetchGameDetails(game: IGame) {
  try {
    return await Array.fromAsync(iterateGameDetails());
  } catch (error) {
    // console.error("Error fetching game details:", error);
    return null;
  }

  function normalizeTo10s(ts: string): string {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const flooredSec = Math.floor(d.getUTCSeconds() / 10) * 10;
    d.setUTCSeconds(flooredSec, 0);
    return d.toISOString();
  }

  async function* iterateGameDetails(startingAt: string = ""): AsyncGenerator<IGameDetails> {
    const normalizedStart = startingAt ? normalizeTo10s(startingAt) : startingAt;
    const gameDetails = await lolESportsAPI.games.getDetails(game.id, normalizedStart);
    yield gameDetails;

    const lastDateTimeRaw = gameDetails.frames.at(-1)?.rfc460Timestamp;
    if (lastDateTimeRaw) {
      const nextStart = normalizeTo10s(lastDateTimeRaw);
      if (normalizedStart && nextStart === normalizedStart) {
        const d = new Date(normalizedStart);
        d.setUTCSeconds(d.getUTCSeconds() + 10);
        const bumpedStart = normalizeTo10s(d.toISOString());
        yield* iterateGameDetails(bumpedStart);
      } else if (normalizedStart && new Date(nextStart) <= new Date(normalizedStart)) {
        return;
      } else {
        yield* iterateGameDetails(nextStart);
      }
    }
  }
}
