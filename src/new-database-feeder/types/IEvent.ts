import type { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";

export type IEvent = Awaited<ReturnType<typeof lolESportsAPI.leagues.getSchedule>>["data"]["schedule"]["events"][number];
