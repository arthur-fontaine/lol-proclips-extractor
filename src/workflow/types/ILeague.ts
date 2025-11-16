import type { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";

export type ILeague = Awaited<ReturnType<typeof lolESportsAPI.leagues.get>>["data"]["leagues"][number];
