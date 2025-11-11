import { lolESportsAPI } from "../external-services/lol-esports-api/lolESportsAPI.ts";
import type { InferAsyncGenerator } from "../lib/types/InferAsyncGenerator.ts";
import type { iterateLeagueEvents } from "./02_iterateLeagueEvents.ts";

export async function* iterateGames(event_: InferAsyncGenerator<typeof iterateLeagueEvents>) {
  const { data: { event } } = await lolESportsAPI.matches.getEvent(event_.match.id);
  yield* event.match.games;
}
