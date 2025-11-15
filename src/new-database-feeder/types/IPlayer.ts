import type { Match } from "../../external-services/database/schemas/matchSchema.ts";

export type IPlayer = Match["games"][number]["players"][number]
