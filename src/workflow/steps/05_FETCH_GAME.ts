import { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IGame } from "../types/IGame.ts";

export const FETCH_GAME = createWorkflowStep({
  name: "FETCH_GAME",
  async *execute({ game }: { game: IGame }) {
    const window = await fetchGameWindow(game);
    const firstFrame = await fetchFirstGameFrame(game);
    yield { game: { ...game, ...window, firstFrame } };
  },
})

async function fetchGameWindow(game: IGame) {
  try {
    return await lolESportsAPI.games.getWindow(game.id);
  } catch (error) {
    // console.error("Error fetching game window:", error);
    return null;
  }
}

async function fetchFirstGameFrame(game: IGame) {
  try {
    const gameDetails = await lolESportsAPI.games.getDetails(game.id, "");
    return gameDetails.frames[0];
  } catch (error) {
    // console.error("Error fetching first game frames:", error);
    return null;
  }
}
