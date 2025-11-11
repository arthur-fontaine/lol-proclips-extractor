import { lolESportsAPI } from "../external-services/lol-esports-api/lolESportsAPI.ts";
import type { InferAsyncGenerator } from "../lib/types/InferAsyncGenerator.ts";
import type { iterateGames } from "./03_iterateGames.ts";

export async function* pipeGameDetails<T extends InferAsyncGenerator<typeof iterateGames>>(game: T) {
  try {
    const gameDetails = await Array.fromAsync(iterateGameDetails());
    yield { ...game, details: gameDetails };
  } catch (error) {
    console.error("Error fetching game details:", error);
    yield { ...game, details: null };
  }

  type LolGameDetails = Awaited<ReturnType<typeof lolESportsAPI.games.getDetails>>;

  function normalizeTo10s(ts: string): string {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const flooredSec = Math.floor(d.getUTCSeconds() / 10) * 10;
    d.setUTCSeconds(flooredSec, 0);
    return d.toISOString();
  }

  async function* iterateGameDetails(startingAt: string = ""): AsyncGenerator<LolGameDetails> {
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
