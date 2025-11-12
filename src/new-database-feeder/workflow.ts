import { createWorkflowEngine } from "../lib/workflower/WorkflowEngine.ts";
import { FETCH_EVENT_GAMES } from "./steps/FETCH_EVENT_GAMES.ts";
import { FETCH_GAME } from "./steps/FETCH_GAME.ts";
import { FETCH_GAME_DETAILS } from "./steps/FETCH_GAME_DETAILS.ts";
import { FETCH_LEAGUE_EVENTS } from "./steps/FETCH_LEAGUE_EVENTS.ts";
import { FETCH_LEAGUES } from "./steps/FETCH_LEAGUES.ts";
import { FILTER_BY_PLAYER } from "./steps/FILTER_PLAYER.ts";

const engine = createWorkflowEngine(100)
  .addStep(FETCH_LEAGUES, [FETCH_LEAGUE_EVENTS])
  .addStep(FETCH_LEAGUE_EVENTS, [FETCH_EVENT_GAMES])
  .addStep(FETCH_EVENT_GAMES, [FETCH_GAME])
  .addStep(FETCH_GAME, [FILTER_BY_PLAYER])
  .addStep(FILTER_BY_PLAYER, [FETCH_GAME_DETAILS]);

void engine.run(FETCH_LEAGUES, undefined);
