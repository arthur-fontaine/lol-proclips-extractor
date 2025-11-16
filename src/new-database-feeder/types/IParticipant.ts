import type { IGame } from "./IGame.ts";

export type IParticipant = NonNullable<IGame.Aggregated["gameMetadata"]>["blueTeamMetadata"]["participantMetadata"][number]
