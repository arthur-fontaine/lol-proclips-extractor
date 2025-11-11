import type { InferAsyncGenerator } from "../lib/types/InferAsyncGenerator.ts";
import type { pipeGameWindow } from "./04_pipeGameWindow.ts";

export async function* iterateGamePlayers(game: InferAsyncGenerator<typeof pipeGameWindow>) {
  yield* game.window?.gameMetadata.blueTeamMetadata.participantMetadata ?? [];
  yield* game.window?.gameMetadata.redTeamMetadata.participantMetadata ?? [];
}
