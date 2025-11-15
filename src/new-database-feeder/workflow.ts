import { createWorkflowEngine } from "../lib/workflower/WorkflowEngine.ts";
import { FETCH_EVENT_GAMES } from "./steps/03_FETCH_EVENT_GAMES.ts";
import { FETCH_GAME } from "./steps/04_FETCH_GAME.ts";
import { FETCH_GAME_DETAILS } from "./steps/06_FETCH_GAME_DETAILS.ts";
import { FETCH_LEAGUE_EVENTS } from "./steps/02_FETCH_LEAGUE_EVENTS.ts";
import { FETCH_LEAGUES } from "./steps/01_FETCH_LEAGUES.ts";
import { FILTER_GAME_BY_PLAYER } from "./steps/05_FILTER_GAME_BY_PLAYER.ts";
import { PICK_PREFERRED_VOD } from "./steps/07_PICK_PREFERRED_VOD.ts";
import { DOWNLOAD_VOD } from "./steps/08_DOWNLOAD_VOD.ts";
import { EXTRACT_FRAME_FROM_VOD } from "./steps/09_EXTRACT_FRAME_FROM_VOD.ts";
import { EXTRACT_GAME_TIMESTAMP_FROM_FRAME } from "./steps/10_EXTRACT_GAME_TIMESTAMP_FROM_FRAME.ts";
import { INSERT_IN_DATABASE } from "./steps/11_INSERT_IN_DATABASE.ts";

const engine = createWorkflowEngine(50)
  .addStep(FETCH_LEAGUES, [FETCH_LEAGUE_EVENTS])
  .addStep(FETCH_LEAGUE_EVENTS, [FETCH_EVENT_GAMES])
  .addStep(FETCH_EVENT_GAMES, [FETCH_GAME])
  .addStep(FETCH_GAME, [FILTER_GAME_BY_PLAYER])
  .addStep(FILTER_GAME_BY_PLAYER, [FETCH_GAME_DETAILS])
  .addStep(FETCH_GAME_DETAILS, [PICK_PREFERRED_VOD])
  .addStep(PICK_PREFERRED_VOD, [DOWNLOAD_VOD])
  .addStep(DOWNLOAD_VOD, [EXTRACT_FRAME_FROM_VOD])
  .addStep(EXTRACT_FRAME_FROM_VOD, [EXTRACT_GAME_TIMESTAMP_FROM_FRAME])
  .addStep(EXTRACT_GAME_TIMESTAMP_FROM_FRAME, [INSERT_IN_DATABASE]);

void await engine.run(FETCH_LEAGUES, undefined);
