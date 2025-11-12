import { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IEvent } from "../types/IEvent.ts";
import type { ILeague } from "../types/ILeague.ts";

export const FETCH_LEAGUE_EVENTS = createWorkflowStep({
  name: "FETCH_LEAGUE_EVENTS",
  async *execute({ league }: { league: ILeague }) {
    for await (const event of innerIterateLeagueEvents(null)) yield { event };

    async function* innerIterateLeagueEvents(token: string | null, visited = new Set<string>()): AsyncGenerator<IEvent> {
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
  },
})
