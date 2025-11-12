import type { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";

export type IGame = Awaited<ReturnType<typeof lolESportsAPI.matches.getEvent>>["data"]["event"]["match"]["games"][number];
