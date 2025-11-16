import { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";

export const FETCH_LEAGUES = createWorkflowStep({
  name: "FETCH_LEAGUES",
  async *execute() {
    const { data: { leagues } } = await lolESportsAPI.leagues.get();
    for (const league of leagues) yield { league };
  },
})
