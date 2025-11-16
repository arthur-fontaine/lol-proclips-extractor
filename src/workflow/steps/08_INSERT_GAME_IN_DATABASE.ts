import { database } from "../../external-services/database/database.ts";
import type { Player } from "../../external-services/database/schemas/playerSchema.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";
import { formatSummonerName } from "../utils/formatSummonerName.ts";
import { FETCH_LEAGUE_EVENTS } from "./02_FETCH_LEAGUE_EVENTS.ts";
import { INSERT_MATCH_IN_DATABASE } from "./03_INSERT_MATCH_IN_DATABASE.ts";

export const INSERT_GAME_IN_DATABASE = createWorkflowStep({
  name: "INSERT_GAME_IN_DATABASE",
  async *execute({ game }: { game: IGame.With<IGame.Aggregated & IGame.Details> }, ctx) {
    const { event: { databaseId: matchDbId } = {} } = ctx.getHistory(INSERT_MATCH_IN_DATABASE)[0] ?? {};
    if (!matchDbId) throw new Error("Missing match database ID from INSERT_MATCH_IN_DATABASE step.");

    const teams = await Array.fromAsync(formatTeams(game));
    const events = await Array.fromAsync(formatEvents(game));

    await database.models.Match.updateOne(
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

async function* formatTeams(game: IGame.With<IGame.Aggregated & IGame.Details>) {
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

async function* formatEvents(game: IGame.With<IGame.Aggregated & IGame.Details>) {
  const frames = game.details?.flatMap(({ frames }) => frames) ?? [];

  const firstFrameTimestamp = game.firstFrame?.rfc460Timestamp;
  if (!firstFrameTimestamp) throw new Error("Missing first frame timestamp.");
  const getRelativeTimestampSeconds = (absolute: Date) =>
    (absolute.getTime() - new Date(firstFrameTimestamp).getTime()) / 1000;

  const playerDeaths = new Map<number, number>();
  const playerKills = new Map<number, number>();
  const playerAssists = new Map<number, number>();

  for (const frame of frames) {
    for (const participantStats of frame.participants) {
      const participant = await findParticipantInDatabase(participantStats.participantId, game);

      const previousDeaths = playerDeaths.get(participantStats.participantId) ?? 0;
      const previousKills = playerKills.get(participantStats.participantId) ?? 0;
      const previousAssists = playerAssists.get(participantStats.participantId) ?? 0;

      const baseEvent = {
        relativeTimestampSeconds: getRelativeTimestampSeconds(new Date(frame.rfc460Timestamp)),
        playerId: participant._id,
      };

      if (participantStats.deaths > previousDeaths) {
        yield { ...baseEvent, type: "death" };
        playerDeaths.set(participantStats.participantId, participantStats.deaths);
      }
      if (participantStats.kills > previousKills) {
        yield { ...baseEvent, type: "kill" };
        playerKills.set(participantStats.participantId, participantStats.kills);
      }
      if (participantStats.assists > previousAssists) {
        yield { ...baseEvent, type: "assist" };
        playerAssists.set(participantStats.participantId, participantStats.assists);
      }
    }
  }
}

const participantDatabaseCache = new Map<number, Promise<Player>>();
async function findParticipantInDatabase(participantId: number, game: IGame.With<IGame.Aggregated & IGame.Details>) {
  const allParticipants = [
    ...(game.gameMetadata?.blueTeamMetadata?.participantMetadata ?? []),
    ...(game.gameMetadata?.redTeamMetadata?.participantMetadata ?? []),
  ];
  const participant = allParticipants.find(p => p.participantId === participantId);
  if (!participant) throw new Error("Participant not found.");

  if (participantDatabaseCache.has(participantId)) {
    return participantDatabaseCache.get(participantId)!;
  }

  const playerPromise = database.models.Player.upsert(
    { "externalIds.leagueOfLegends": participant.esportsPlayerId },
    {
      $setOnInsert: {
        "externalIds.leagueOfLegends": participant.esportsPlayerId,
        summonerName: formatSummonerName(participant.summonerName),
      },
    }
  );
  participantDatabaseCache.set(participantId, playerPromise);
  const player = await playerPromise;

  return player;
}
