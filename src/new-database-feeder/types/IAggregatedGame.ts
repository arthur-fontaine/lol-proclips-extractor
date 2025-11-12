import type { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import type { IGame } from "./IGame.ts";

export type IAggregatedGame =
  IGame
  & Partial<Awaited<ReturnType<typeof lolESportsAPI.games.getWindow>>>
  & { firstFrame: Awaited<ReturnType<typeof lolESportsAPI.games.getDetails>>["frames"][number] | null };
