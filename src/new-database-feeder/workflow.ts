import { createWorkflowEngine } from "../lib/workflower/WorkflowEngine.ts";
import { FETCH_EVENT_GAMES } from "./steps/FETCH_EVENT_GAMES.ts";
import { FETCH_GAME } from "./steps/FETCH_GAME.ts";
import { FETCH_LEAGUE_EVENTS } from "./steps/FETCH_LEAGUE_EVENTS.ts";
import { FETCH_LEAGUES } from "./steps/FETCH_LEAGUES.ts";

const engine = createWorkflowEngine(100)
  .addStep(FETCH_LEAGUES, [FETCH_LEAGUE_EVENTS])
  .addStep(FETCH_LEAGUE_EVENTS, [FETCH_EVENT_GAMES])
  .addStep(FETCH_EVENT_GAMES, [FETCH_GAME]);

void engine.run(FETCH_LEAGUES, undefined);
