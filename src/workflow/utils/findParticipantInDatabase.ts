import { database } from "../../external-services/database/database.ts";
import type { Player } from "../../external-services/database/schemas/playerSchema.ts";
import type { IGame } from "../types/IGame.ts";
import { formatSummonerName } from "./formatSummonerName.ts";

const participantDatabaseCache = new Map<number, Promise<Player>>();
export async function findParticipantInDatabase(participantId: number, game: IGame.With<IGame.Aggregated>) {
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
