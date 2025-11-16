import { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";
import type { IGameDetails } from "../types/IGameDetails.ts";
import { findParticipantInDatabase } from "../utils/findParticipantInDatabase.ts";

export const FETCH_GAME_DETAILS = createWorkflowStep({
  name: "FETCH_GAME_DETAILS",
  async *execute({ game }: { game: IGame.With<IGame.Aggregated & IGame.Events> }) {
    const events = await Array.fromAsync(formatEvents(
      game,
      iterateGameDetails(game),
    ));
    yield { game: { ...game, events } };
  },
})

async function* iterateGameDetails(game: IGame, startingAt: string = ""): AsyncGenerator<IGameDetails> {
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
      yield* iterateGameDetails(game, bumpedStart);
    } else if (normalizedStart && new Date(nextStart) <= new Date(normalizedStart)) {
      return;
    } else {
      yield* iterateGameDetails(game, nextStart);
    }
  }

  function normalizeTo10s(ts: string): string {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const flooredSec = Math.floor(d.getUTCSeconds() / 10) * 10;
    d.setUTCSeconds(flooredSec, 0);
    return d.toISOString();
  }
}

async function* formatEvents(game: IGame.With<IGame.Aggregated>, gameDetailsGenerator: AsyncGenerator<IGameDetails>) {
  const firstFrameTimestamp = game.firstFrame?.rfc460Timestamp;
  if (!firstFrameTimestamp) throw new Error("Missing first frame timestamp.");
  const getRelativeTimestampSeconds = (absolute: Date) =>
    (absolute.getTime() - new Date(firstFrameTimestamp).getTime()) / 1000;

  const playerDeaths = new Map<number, number>();
  const playerKills = new Map<number, number>();
  const playerAssists = new Map<number, number>();

  for await (const gameDetails of gameDetailsGenerator) {
    for (const frame of gameDetails.frames) {
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
}
