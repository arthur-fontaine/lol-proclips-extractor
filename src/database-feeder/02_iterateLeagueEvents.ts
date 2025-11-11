import { lolESportsAPI } from "../external-services/lol-esports-api/lolESportsAPI.ts";
import type { InferAsyncGenerator } from "../lib/types/InferAsyncGenerator.ts";
import type { iterateLeagues } from "./01_iterateLeagues.ts";

export async function* iterateLeagueEvents(league: InferAsyncGenerator<typeof iterateLeagues>) {
  yield* innerIterateLeagueEvents(null);

  type LolEvent = Awaited<ReturnType<typeof lolESportsAPI.leagues.getSchedule>>["data"]["schedule"]["events"][number];
  async function* innerIterateLeagueEvents(token: string | null, visited = new Set<string>()): AsyncGenerator<LolEvent> {
    const {
      data: { schedule },
    } = await lolESportsAPI.leagues.getSchedule(league.id, token ?? undefined);
    if (token) visited.add(token);

    yield* schedule.events;

    const olderToken = schedule.pages.older;
    if (olderToken) {
      yield* innerIterateLeagueEvents(olderToken, visited);
    }
  }
}
