import { database } from "../../external-services/database/database.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";
import { findParticipantInDatabase } from "../utils/findParticipantInDatabase.ts";
import { INSERT_MATCH_IN_DATABASE } from "./03_INSERT_MATCH_IN_DATABASE.ts";

export const INSERT_GAME_IN_DATABASE = createWorkflowStep({
  name: "INSERT_GAME_IN_DATABASE",
  async *execute({ game }: { game: IGame.With<IGame.Aggregated & IGame.Events> }, ctx) {
    const { event: { databaseId: matchDbId } = {} } = ctx.getHistory(INSERT_MATCH_IN_DATABASE)[0] ?? {};
    if (!matchDbId) throw new Error("Missing match database ID from INSERT_MATCH_IN_DATABASE step.");

    const teams = await Array.fromAsync(formatTeams(game));
    const events = game.events;

    const isGameExists = await database.models.Match.exists({
      _id: matchDbId,
      "games.externalIds.leagueOfLegends": game.id,
    })

    if (!isGameExists) await database.models.Match.updateOne(
      { _id: matchDbId },
      {
        $push: {
          games: {
            externalIds: { leagueOfLegends: game.id },
            teams,
            vods: [], // vods will be added later
            events,
          },
        },
      },
    )

    yield { game };
  },
})

async function* formatTeams(game: IGame.With<IGame.Aggregated & IGame.Events>) {
  for (const team of game.teams) {
    const metadata = game.gameMetadata?.[`${team.side}TeamMetadata`]
    if (!metadata) continue;

    const playerIds = await Promise.all(
      metadata.participantMetadata.map(async participant =>
        findParticipantInDatabase(participant.participantId, game).then(({ _id }) => _id)
      )
    );

    yield {
      externalIds: { leagueOfLegends: team.id },
      playerIds,
    };
  }
}
