import { createWorkflowEngine } from "../lib/workflower/WorkflowEngine.ts";
import { FETCH_EVENT_GAMES } from "./steps/03_FETCH_EVENT_GAMES.ts";
import { FETCH_GAME } from "./steps/04_FETCH_GAME.ts";
import { FETCH_GAME_DETAILS } from "./steps/06_FETCH_GAME_DETAILS.ts";
import { FETCH_LEAGUE_EVENTS } from "./steps/02_FETCH_LEAGUE_EVENTS.ts";
import { FETCH_LEAGUES } from "./steps/01_FETCH_LEAGUES.ts";
import { FILTER_BY_PLAYER } from "./steps/05_FILTER_PLAYER.ts";

const engine = createWorkflowEngine(100)
  .addStep(FETCH_LEAGUES, [FETCH_LEAGUE_EVENTS])
  .addStep(FETCH_LEAGUE_EVENTS, [FETCH_EVENT_GAMES])
  .addStep(FETCH_EVENT_GAMES, [FETCH_GAME])
  .addStep(FETCH_GAME, [FILTER_BY_PLAYER])
  .addStep(FILTER_BY_PLAYER, [FETCH_GAME_DETAILS]);

void engine.run(FETCH_LEAGUES, undefined);
