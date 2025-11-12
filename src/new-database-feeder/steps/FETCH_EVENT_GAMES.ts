import { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";
import { createWorkflowStep } from "../../lib/workflower/workflower.ts";
import type { IEvent } from "../types/IEvent.ts";

export const FETCH_EVENT_GAMES = createWorkflowStep({
  name: "FETCH_EVENT_GAMES",
  async *execute({ event: event_ }: { event: IEvent }) {
    const { data: { event } } = await lolESportsAPI.matches.getEvent(event_.match.id);
    for (const game of event.match.games) yield { game };
  },
})
