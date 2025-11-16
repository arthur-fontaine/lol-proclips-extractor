import type { lolESportsAPI } from "../../external-services/lol-esports-api/lolESportsAPI.ts";

export type IGameDetails = Awaited<ReturnType<typeof lolESportsAPI.games.getDetails>>;
