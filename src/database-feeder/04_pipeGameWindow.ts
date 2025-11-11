import { lolESportsAPI } from "../external-services/lol-esports-api/lolESportsAPI.ts";
import type { InferAsyncGenerator } from "../lib/types/InferAsyncGenerator.ts";
import type { iterateGames } from "./03_iterateGames.ts";

export async function* pipeGameWindow(game: InferAsyncGenerator<typeof iterateGames>) {
  try {
    const gameWindow = await lolESportsAPI.games.getWindow(game.id);
    yield { ...game, window: gameWindow };
  } catch (error) {
    console.error("Error fetching game window:", error);
    yield { ...game, window: null };
  }
}
