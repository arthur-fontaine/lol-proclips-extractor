import readline from "node:readline";
import type { ObjectId } from "mongodb";
import pLimit from "p-limit";
import { database } from "../external-services/database/database.ts";
import type { InferAsyncGenerator } from "../lib/types/InferAsyncGenerator.ts";
import { throwUndefined } from "../lib/utils/throwUndefined.ts";
import { iterateLeagues } from "./01_iterateLeagues.ts";
import { iterateLeagueEvents } from "./02_iterateLeagueEvents.ts";
import { iterateGames } from "./03_iterateGames.ts";
import { pipeGameWindow } from "./04_pipeGameWindow.ts";
import { pipeGameDetails } from "./05_pipeGameDetails.ts";
import { iterateGamePlayers } from "./06_iterateGamePlayers.ts";

const logBuffer: string[] = [];
function logAboveProgressBar(message: string) {
  logBuffer.push(message);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(`${logBuffer.join("\n")}\n`);
  renderProgress(eventsProgress.done, eventsProgress.active, eventsProgress.total);
}

const eventsProgress = { done: 0, active: 0, total: 0 };
const leaguesProgress = { done: 0, total: 0 };
function renderProgress(done: number, active: number, total: number, width = 40) {
  eventsProgress.done = done;
  eventsProgress.active = active;
  eventsProgress.total = total;

  const pending = Math.max(total - done - active, 0);
  const clamp = (n: number) => Math.max(0, Math.min(width, n));
  const doneW = clamp(Math.round((done / total) * width));
  const activeW = clamp(Math.round((active / total) * width));
  const pendingW = clamp(width - doneW - activeW);

  const bar = "█".repeat(doneW) + "▒".repeat(activeW) + "·".repeat(pendingW);
  const pct = ((done / total) * 100).toFixed(1).padStart(5);
  const label = ` ${pct}%  ✔︎ ${done}  ▶︎ ${active}  … ${pending} / ${total} (League ${leaguesProgress.done}/${leaguesProgress.total})`;

  readline.cursorTo(process.stdout, 0);
  process.stdout.write(bar + label);
}

async function processEvent(event: InferAsyncGenerator<typeof iterateLeagueEvents>, leagueName: string) {
  let gameCount = 0;
  for await (const game of iterateGames(event)) {
    logAboveProgressBar(`Processing game ${game.id} of match ${event.match.id} in league ${leagueName}`);
    for await (const enhancedGame of pipeGameWindow(game)) {
      gameCount++;
      for await (const detailedGame of pipeGameDetails(enhancedGame)) {
        const participantToPlayerId = new Map<number, ObjectId>();

        // upsert players
        for await (const player of iterateGamePlayers(detailedGame)) {
          const playerInserted = await database.models.Player.upsert(
            { "externalIds.leagueOfLegends": player.esportsPlayerId },
            {
              $setOnInsert: {
                summonerName: formatSummonerName(player.summonerName),
                "externalIds.leagueOfLegends": player.esportsPlayerId,
              },
              $set: {
                "externalIds.leagueOfLegends": player.esportsPlayerId,
              },
            },
          );
          participantToPlayerId.set(player.participantId, playerInserted._id);
        }

        // upsert match
        const frames = detailedGame.details?.flatMap(({ frames }) => frames) ?? [];
        const events = Array.from(framesToEvents(frames));
        logAboveProgressBar(`Inserting match ${event.match.id} with ${events.length} events and ${detailedGame.details?.length ?? 0} detail frames.`);
        await database.models.Match.upsert(
          { "externalIds.leagueOfLegends": event.match.id },
          {
            $setOnInsert: {
              "externalIds.leagueOfLegends": event.match.id,
            },
            $push: {
              games: {
                externalIds: { leagueOfLegends: enhancedGame.id },
                players: Array.from(
                  participantToPlayerId.values().map((playerId) => ({ playerId })),
                ),
                vods: enhancedGame.vods.map((vod) => vod.provider === 'youtube' ? {
                  youTubeId: vod.parameter,
                  lang: vod.locale,
                  startTimestamp: vod.startMillis,
                  endTimestamp: vod.endMillis,
                } : undefined).filter(v => v !== undefined),
                events: events
                  .map((e) => {
                    try {
                      return {
                        playerId: throwUndefined(participantToPlayerId.get(e.participantId)),
                        type: e.type,
                        relativeTimestamp:
                          e.absoluteTimestamp.getTime() -
                          new Date(throwUndefined(frames[0]).rfc460Timestamp).getTime(),
                      };
                    } catch (e) {
                      logAboveProgressBar(`Skipping event due to missing playerId: ${e}`);
                      return undefined;
                    }
                  })
                  .filter((e): e is NonNullable<typeof e> => e !== undefined),
              },
            },
          },
        );
      }
    }
  }
  logAboveProgressBar(`Processed ${gameCount} games of match ${event.match.id} in league ${leagueName}`);
}

function* framesToEvents(frames: NonNullable<InferAsyncGenerator<typeof pipeGameDetails>['details']>[number]['frames']) {
  const playerDeaths = new Map<number, number>();
  const playerKills = new Map<number, number>();
  const playerAssists = new Map<number, number>();
  for (const frame of frames) {
    for (const participant of frame.participants) {
      const previousDeaths = playerDeaths.get(participant.participantId) ?? 0;
      const previousKills = playerKills.get(participant.participantId) ?? 0;
      const previousAssists = playerAssists.get(participant.participantId) ?? 0;

      const baseEvent = { absoluteTimestamp: new Date(frame.rfc460Timestamp), participantId: participant.participantId };

      if (participant.deaths > previousDeaths) {
        yield { ...baseEvent, type: "death" };
        playerDeaths.set(participant.participantId, participant.deaths);
      }
      if (participant.kills > previousKills) {
        yield { ...baseEvent, type: "kill" };
        playerKills.set(participant.participantId, participant.kills);
      }
      if (participant.assists > previousAssists) {
        yield { ...baseEvent, type: "assist" };
        playerAssists.set(participant.participantId, participant.assists);
      }
    }
  }
}

function formatSummonerName(summonerName: string): string {
  const re = /[A-Z0-9]{1,3} (.+)/;
  const [, match] = summonerName.match(re) ?? [];
  return match ?? summonerName;
}

{
  // main processing loop

  const leagues = await Array.fromAsync(iterateLeagues());
  leagues.sort((a, b) => {
    const priority = ["lck_challengers_league", "lck"];
    const ia = priority.indexOf(a.slug);
    const ib = priority.indexOf(b.slug);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return a.slug.localeCompare(b.slug);
  });
  leaguesProgress.total = leagues.length;
  
  for (const league of leagues) {
    const limit = pLimit(20);

    const events = await Array.fromAsync(iterateLeagueEvents(league));
    const totalEvents = events.length;

    let done = 0;
    const timer = setInterval(() => {
      renderProgress(done, limit.activeCount, totalEvents);
    }, 100);

    await Promise.all(
      events.map((event) =>
        limit(async () => {
          try {
            await processEvent(event, league.name);
          } finally {
            done++;
            renderProgress(done, limit.activeCount, totalEvents);
          }
        }),
      ),
    );

    leaguesProgress.done++;

    clearInterval(timer);
    process.stdout.write("\n");
  }
}