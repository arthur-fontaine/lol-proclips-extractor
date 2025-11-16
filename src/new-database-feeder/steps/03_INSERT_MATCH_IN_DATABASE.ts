import { database } from "../../external-services/database/database.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IEvent } from "../types/IEvent.ts";

export const INSERT_MATCH_IN_DATABASE = createWorkflowStep({
  name: "INSERT_MATCH_IN_DATABASE",
  async *execute({ event }: { event: IEvent }) {
    const { _id } = await database.models.Match.upsert(
      { "externalIds.leagueOfLegends": event.match.id },
      {
        $setOnInsert: {
          externalIds: { leagueOfLegends: event.match.id },
          games: [],
        },
      },
    )

    yield { event: { ...event, databaseId: _id } };
  },
})
