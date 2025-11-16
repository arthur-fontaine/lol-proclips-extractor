import type { ObjectId } from "mongodb";
import type { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";

export type IGame = Awaited<ReturnType<typeof lolESportsAPI.matches.getEvent>>["data"]["event"]["match"]["games"][number];

export namespace IGame {

  export type With<T> = Omit<IGame, keyof T> & T;
  export type Aggregated =
    & Partial<Awaited<ReturnType<typeof lolESportsAPI.games.getWindow>>>
    & { firstFrame: Awaited<ReturnType<typeof lolESportsAPI.games.getDetails>>["frames"][number] | null };
  export type Events = {
    events: {
      type: string;
      relativeTimestampSeconds: number;
      playerId: ObjectId;
    }[]
  }

}
